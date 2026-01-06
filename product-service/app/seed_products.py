import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.models import Product

CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "cleaned_products.csv"


def seed_products(db: Session):
    # Check if products already exist
    product_count = db.query(Product).count()
    if product_count > 0:
        return

    products = []

    with open(CSV_PATH, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            product = Product(
                name=row["name"],
                description=row.get("description"),
                price=float(row["price"]),
                sku=row.get("sku"),
            )
            products.append(product)

    db.bulk_save_objects(products)
    db.commit()
