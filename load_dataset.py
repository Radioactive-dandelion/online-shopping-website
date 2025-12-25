from datasets import load_dataset

# Загружаем датасет (DatasetDict)
dataset_dict = load_dataset("UniqueData/asos-e-commerce-dataset")

# Берем конкретный сплит, например train
dataset = dataset_dict["train"]

# Сохраняем в CSV
dataset.to_csv("products_asos.csv")

print("CSV файл создан: products_asos.csv")
