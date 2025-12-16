from ..search import index_product, delete_product_from_index, search_products_es
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from ..database import get_db
from .. import models, schemas
from ..search import search_products_es 

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Pydantic v2 style: model_dump()
    product = models.Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    # index in Elasticsearch
    index_product(product)

    return product







@router.get("/search", response_model=List[schemas.ProductOut])
def search_products(
    q: str = Query(..., description="Search text"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # 1) Try Elasticsearch
    es_ids = search_products_es(q, category)

    if es_ids:  # got valid ids from ES
        products = (
            db.query(models.Product)
            .filter(models.Product.id.in_(es_ids))
            .all()
        )
        # keep ES ranking order
        order = {pid: i for i, pid in enumerate(es_ids)}
        products.sort(key=lambda p: order.get(p.id, 9999))
        return products

    # 2) Fallback: plain SQL LIKE search if ES failed / unavailable
    pattern = f"%{q}%"

    query = db.query(models.Product).filter(
        or_(
            models.Product.name.ilike(pattern),
            models.Product.description.ilike(pattern),
            models.Product.category.ilike(pattern),
        )
    )

    if category:
        query = query.filter(models.Product.category == category)

    return query.all()


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/", response_model=List[schemas.ProductOut])
def list_products(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = Query(20, le=100),
):
    query = db.query(models.Product)

    if category:
        query = query.filter(models.Product.category == category)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if in_stock is True:
        query = query.filter(models.Product.stock > 0)

    return query.offset(skip).limit(limit).all()

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product_in: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in product_in.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    # re-index in ES
    index_product(product)

    return product



@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    # remove from ES
    delete_product_from_index(product_id)

    return




