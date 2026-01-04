from fastapi import FastAPI

from .database import Base, engine
from . import models
from .routers import products as products_router
from .search import init_index

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Service")


@app.on_event("startup")
def on_startup():
    # Ensure ES index exists
    init_index()


app.include_router(products_router.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "product-service"}
