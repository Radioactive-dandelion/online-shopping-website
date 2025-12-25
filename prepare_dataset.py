import pandas as pd
import re
import ast
import json

# -------------------------------------
# 🟩 1. Бренды для описаний (regex)
# -------------------------------------
BRAND_REGEX = [
    r"ASOS(\s+DESIGN)?",
    r"Pull\s*(&|and)\s*Bear",
    r"New\s*Look",
    r"Stradivarius",
    r"Bershka",
    r"Zara",
    r"H&M",
    r"Mango",
    r"River\s*Island",
    r"Topshop",
]

# -------------------------------------
# 🟩 2. Бренды для названий/категорий (строкой!)
# -------------------------------------
BRAND_NAMES = [
    "ASOS DESIGN",
    "ASOS",
    "PULL & BEAR",
    "PULL AND BEAR",
    "NEW LOOK",
    "RIVER ISLAND",
    "STRADIVARIUS",
    "BERSHKA",
    "ZARA",
    "H&M",
    "MANGO",
    "TOPSHOP",
]

# сортируем по длине — большие сначала
BRAND_NAMES = sorted(BRAND_NAMES, key=len, reverse=True)


# -------------------------------------
# 🟩 3. Очистка описания
# -------------------------------------
def clean_description(text):
    if not text or pd.isna(text):
        return ""

    text = str(text)

    text = re.sub(r"[\[\]{}\"']", " ", text)

    # удаляем бренды
    brand_pattern = r"|".join(BRAND_REGEX)
    text = re.sub(brand_pattern, "", text, flags=re.IGNORECASE)

    # удаляем лишние секции
    text = re.sub(
        r"(Product\s*Details|Brand|Size\s*&\s*Fit|Look\s*After\s*Me|About\s*Me|Product\s*Code)\s*[:\-]\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    # удаляем URL
    text = re.sub(r"http[s]?://\S+", "", text)

    # мусор
    text = re.sub(r"[•·▶►]", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text


# -------------------------------------
# 🟩 4. Удаление бренда из name/category
# -------------------------------------
def clean_brand_name(name):
    if not isinstance(name, str):
        return name

    s = name.strip()
    if not s:
        return s

    # 1) удаляем бренд в виде строки
    for brand in BRAND_NAMES:
        pat = r"^\s*" + re.escape(brand) + r"(\b|\s|$)"
        if re.search(pat, s, flags=re.IGNORECASE):
            s = re.sub(pat, "", s, flags=re.IGNORECASE)
            break

    # 2) fallback — удаляем первое слово
    parts = s.split()
    if len(parts) > 1:
        s = " ".join(parts[1:])

    # 3) финальная очистка
    s = re.sub(r"\s+", " ", s).strip()

    return s


def delete_brands_name(df):
    if "name" in df.columns:
        df["name"] = df["name"].fillna("").astype(str).apply(clean_brand_name)

    if "category" in df.columns:
        df["category"] = df["category"].fillna("").astype(str).apply(clean_brand_name)

    return df


# -------------------------------------
# 🟩 5. Parse sizes
# -------------------------------------
def parse_sizes(size_str):
    if not size_str or pd.isna(size_str):
        return []

    s = str(size_str).strip()
    if not s:
        return []

    sizes_raw = None
    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, (list, tuple)):
            sizes_raw = [str(x) for x in parsed]
    except:
        pass

    if sizes_raw is None:
        sizes_raw = re.split(r'[,\;\|/]\s*', s)

    cleaned = []
    seen = set()

    for token in sizes_raw:
        if not token:
            continue

        tok = str(token).strip()

        out_of_stock = bool(re.search(r'out\s*of\s*stock', tok, flags=re.IGNORECASE))

        tok = re.sub(r'[-–—]\s*(?:from\s*)?[£$€]\s*\d[\d,\,\.]*', '', tok, flags=re.IGNORECASE)
        tok = re.sub(r'(?:from\s*)?[£$€]\s*\d[\d,\,\.]*', '', tok, flags=re.IGNORECASE)

        tok = re.sub(r'[\-\–\—]?\s*\(?\s*out\s*of\s*stock\s*\)?', '', tok, flags=re.IGNORECASE)

        tok = tok.strip(" '\"")

        tok = re.sub(r'([A-Za-z]+)(\d)', r'\1 \2', tok)
        tok = re.sub(r'(\d)([A-Za-z]+)', r'\1 \2', tok)

        tok = re.sub(r'\s+', ' ', tok).strip()

        if not tok:
            continue

        key = tok.lower()
        if key in seen:
            continue
        seen.add(key)

        cleaned.append({
            "size": tok,
            "available": not out_of_stock
        })

    return cleaned


# -------------------------------------
# 🟩 6. Цены
# -------------------------------------
def parse_price(price_str):
    if price_str is None:
        return None

    s = str(price_str).strip()

    if not s:
        return None

    s = re.sub(r'^\s*from\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'[£$€]', '', s)
    s = s.replace(',', '').strip()

    try:
        return float(s)
    except:
        m = re.search(r'\d+[\d\.]*', s)
        if m:
            try:
                return float(m.group(0))
            except:
                return None
        return None


# -------------------------------------
# 🟩 7. Slice
# -------------------------------------
def slice_and_filter(df):
    df = df.dropna()
    df = df.drop(columns=["url", "sku"], errors="ignore")
    df = df.sample(2000, random_state=42)
    return df


def parse_images(images_str):
    if not isinstance(images_str, str):
        return []
    try:
        data = ast.literal_eval(images_str)
        return [x.strip() for x in data if x.strip()]
    except:
        return []


# -------------------------------------
# 🟩 8. Women filter
# -------------------------------------
WOMEN_KEYWORDS = [
    "women", "woman", "female", "dress", "skirt", "heels", "sandals", "boots",
    "coat", "jacket", "top", "blouse", "leggings", "jeans", "trousers", "bag"
]


def is_women_product(name, category):
    txt = (str(name) + " " + str(category)).lower()
    return any(k in txt for k in WOMEN_KEYWORDS)


# -------------------------------------
# 🟩 9. Main
# -------------------------------------
def clean_dataset(input_csv, output_csv, output_json):

    df = pd.read_csv(input_csv)

    df = slice_and_filter(df)

    df = delete_brands_name(df)

    df["price"] = df["price"].apply(parse_price)

    df = df[df.apply(lambda r: is_women_product(r["name"], r["category"]), axis=1)]

    df["description"] = df["description"].apply(clean_description)

    df["size"] = df["size"].apply(parse_sizes)

    df["images"] = df["images"].apply(parse_images)

    df["color"] = df["color"].str.strip().str.lower()
    df["category"] = df["category"].str.strip()

    df.to_csv(output_csv, index=False)

    products = df.to_dict(orient="records")
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("\n✔ Done!")
    print("CSV:", output_csv)
    print("JSON:", output_json)


# -------------------------------------
# 🟩 10. Run
# -------------------------------------
if __name__ == "__main__":
    clean_dataset(
        input_csv="products_asos.csv",
        output_csv="cleaned_products.csv",
        output_json="cleaned_products.json"
    )
