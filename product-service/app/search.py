import os
from typing import List, Optional

from elasticsearch import Elasticsearch
from elastic_transport import ConnectionError as ESConnectionError

ES_URL = os.getenv("ELASTICSEARCH_URL", "http://product-elasticsearch:9200")
INDEX_NAME = "products"

es = Elasticsearch(ES_URL)


def init_index() -> None:
    try:
        if es.indices.exists(index=INDEX_NAME):
            return

        es.indices.create(
            index=INDEX_NAME,
            mappings={
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "text"},
                    "description": {"type": "text"},
                    "category": {"type": "keyword"},
                    "price": {"type": "float"},
                    "color": {"type": "keyword"},
                    "size": {"type": "keyword"},
                    "sku": {"type": "keyword"},
                    "images": {"type": "keyword"},
                    "stock": {"type": "integer"},
                    "is_active": {"type": "boolean"},
                }
            },
        )
        print("✅ ES index 'products' created")
    except ESConnectionError as e:
        print("⚠️ Elasticsearch not ready, skipping init_index for now:", e)
    except Exception as e:
        print("⚠️ Error initializing Elasticsearch index:", e)


def index_product(product) -> None:
    """Index product document in ES. Never crash if ES is unhappy."""
    doc = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "price": float(product.price),
        "color": product.color,
        "size": product.size,
        "sku": product.sku,
        "images": product.images,
        "stock": product.stock,
        "is_active": product.is_active,
    }

    try:
        es.index(index=INDEX_NAME, id=product.id, document=doc)
    except Exception as e:
        print("⚠️ Error indexing product in ES, ignoring:", e)


def delete_product_from_index(product_id: int) -> None:
    try:
        es.delete(index=INDEX_NAME, id=product_id, ignore=[404])
    except Exception as e:
        print("⚠️ Error deleting product from ES, ignoring:", e)


def search_products_es(
    q: str, category: Optional[str] = None, limit: int = 50
) -> Optional[List[int]]:
    """
    Try search in ES. On ANY error, return None so router can fallback to DB.
    """
    try:
        must = [
            {
                "multi_match": {
                    "query": q,
                    "fields": ["name^3", "description", "category", "color", "size"],
                }
            }
        ]
        if category:
            must.append({"term": {"category": category}})

        query = {
            "bool": {
                "must": must,
                "filter": [{"term": {"is_active": True}}],
            }
        }

        resp = es.search(index=INDEX_NAME, query=query, size=limit)
        hits = resp.get("hits", {}).get("hits", [])
        ids = [hit["_source"]["id"] for hit in hits if "_source" in hit]
        return ids
    except Exception as e:
        print("⚠️ Elasticsearch search failed, falling back to DB:", e)
        return None
