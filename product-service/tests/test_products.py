# tests/test_products.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def product_payload():
    """Base product payload used in multiple tests."""
    return {
        "name": "Test Knit Top",
        "description": "Simple test product created during tests.",
        "price": 199.0,
        "category": "Tops",
        "stock": 5,
        "is_active": True,
        "size": "S",
        "color": "Black",
        "sku": "TEST-SKU-001",
        "images": ["https://picsum.photos/seed/test-knit/800/1200"],
    }


@pytest.fixture
def created_product(product_payload):
    """
    Create a product before a test, and delete it afterwards.
    This keeps the DB relatively clean.
    """
    resp = client.post("/products/", json=product_payload)
    assert resp.status_code == 201
    data = resp.json()
    product_id = data["id"]

    # give test access to created product
    yield data

    # cleanup (ignore errors if already deleted)
    client.delete(f"/products/{product_id}")


# -------------------------------
# Basic service health tests
# -------------------------------

def test_health_ok():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "product-service"


def test_list_products_ok():
    # use the version with trailing slash to avoid 307 redirect
    resp = client.get("/products/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


# -------------------------------
# CRUD tests
# -------------------------------

def test_create_product_and_get_by_id(product_payload):
    # create
    resp = client.post("/products/", json=product_payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["id"] is not None
    assert created["name"] == product_payload["name"]
    product_id = created["id"]

    # get by id
    resp2 = client.get(f"/products/{product_id}")
    assert resp2.status_code == 200
    fetched = resp2.json()
    assert fetched["id"] == product_id
    assert fetched["sku"] == product_payload["sku"]

    # cleanup
    client.delete(f"/products/{product_id}")


def test_get_product_not_found():
    resp = client.get("/products/9999999")
    assert resp.status_code in (404, 400)  # depending how you raise HTTPException


def test_update_product(created_product):
    product_id = created_product["id"]

    update_payload = {
        "name": "Updated Test Knit Top",
        "description": created_product["description"],
        "price": created_product["price"] + 10,
        "category": created_product["category"],
        "stock": created_product["stock"] + 3,
        "is_active": True,
        "size": created_product["size"],
        "color": "Blue",
        "sku": created_product["sku"],  # usually unchanged
        "images": created_product["images"],
    }

    resp = client.put(f"/products/{product_id}", json=update_payload)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["id"] == product_id
    assert updated["name"] == "Updated Test Knit Top"
    assert updated["color"] == "Blue"
    assert updated["stock"] == created_product["stock"] + 3


def test_delete_product(created_product):
    product_id = created_product["id"]

    resp = client.delete(f"/products/{product_id}")
    assert resp.status_code in (200, 204)

    # then it should not be found any more
    resp2 = client.get(f"/products/{product_id}")
    assert resp2.status_code in (404, 400)


# -------------------------------
# Search endpoint tests
# -------------------------------

def test_search_products_returns_list_even_if_no_match():
    resp = client.get("/products/search", params={"q": "something-that-does-not-exist"})
    # after our ES fallback this should be 200, not 500
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_search_products_by_name_or_description(created_product):
    # use part of the name we know
    resp = client.get("/products/search", params={"q": "Knit"})
    assert resp.status_code == 200
    results = resp.json()
    assert isinstance(results, list)

    # there should be at least one result with our test product's id or name
    ids = [p.get("id") for p in results]
    names = [p.get("name") for p in results]
    assert created_product["id"] in ids or created_product["name"] in names


def test_search_products_by_category_filter(created_product):
    resp = client.get(
        "/products/search",
        params={"q": "", "category": created_product["category"]},
    )
    assert resp.status_code == 200
    results = resp.json()
    assert isinstance(results, list)

    # all results (if any) should have the same category
    for p in results:
        assert p["category"] == created_product["category"]
