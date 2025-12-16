from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    url: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    sku: Optional[str] = None
    images: Optional[List[str]] = None

    stock: Optional[int] = None
    is_active: Optional[bool] = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    # allow partial updates
    name: Optional[str] = None
    price: Optional[float] = None

class ProductOut(ProductBase):
    id: int

    #Pydantic v2 style
    model_config = ConfigDict(from_attributes=True)

