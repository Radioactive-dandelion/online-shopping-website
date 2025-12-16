import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const API_BASE = "http://localhost:3000/api";

function formatPrice(priceTRY) {
  // simple TRY price
  return `${priceTRY.toFixed(0)} ₺`;
}

function App() {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("featured");

  const navigate = useNavigate();

  // later you can connect these to real data
  const wishlistCount = 0;
  const bagCount = 0;

  // ---- helpers to build URLs ----
  const buildListUrl = (category = "") => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    params.append("limit", 100);
    return `${API_BASE}/products?${params.toString()}`;
  };

  const buildSearchUrl = (term, category = "") => {
    const params = new URLSearchParams();
    params.append("q", term);
    if (category) params.append("category", category);
    return `${API_BASE}/products/search?${params.toString()}`;
  };

  const sortProducts = (items, option) => {
    const copy = [...items];
    if (option === "price_low") {
      copy.sort((a, b) => a.price - b.price);
    } else if (option === "price_high") {
      copy.sort((a, b) => b.price - a.price);
    }
    return copy;
  };

  // ---- initial load: all products + categories from backend ----
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(buildListUrl(""));
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        const data = await res.json();
        setProducts(sortProducts(data, sortOption));

        const cats = Array.from(
          new Set(
            data
              .map((p) => p.category)
              .filter((c) => c && c.trim().length > 0)
          )
        );
        setAllCategories(cats);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- resort on sort change ----
  useEffect(() => {
    setProducts((prev) => sortProducts(prev, sortOption));
  }, [sortOption]);

  // ---- actions ----
  const loadByCategory = async (categoryValue) => {
    try {
      setLoading(true);
      setError("");
      setSelectedCategory(categoryValue);

      let url;
      if (searchTerm.trim()) {
        url = buildSearchUrl(searchTerm.trim(), categoryValue);
      } else {
        url = buildListUrl(categoryValue);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(sortProducts(data, sortOption));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const term = searchTerm.trim();

    try {
      setLoading(true);
      setError("");
      let url;
      if (term) {
        url = buildSearchUrl(term, selectedCategory);
      } else {
        url = buildListUrl(selectedCategory);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(sortProducts(data, sortOption));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  const resetToHome = async () => {
    try {
      setLoading(true);
      setError("");
      setSearchTerm("");
      setSelectedCategory("");
      setSortOption("featured");

      const res = await fetch(buildListUrl("")); // all products
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(sortProducts(data, "featured"));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ---- render ----
  return (
    <div className="page">
      {/* Top bar: NEED HELP + PROFILE */}
      <div className="top-utility-bar">
        <div className="utility-left" />
        <div className="utility-right">
          <button className="link-button">PROFILE</button>
          <button className="link-button">LOGIN</button>
        </div>
      </div>

      {/* Main header */}
      <header className="main-header">
        <div className="header-left">
          <button className="link-button">WOMEN</button>
        </div>

        <div className="header-center">
          {/* Logo = reset filters + reload all */}
          <button className="logo logo-button" onClick={resetToHome}>
            mimi
          </button>
        </div>

        <div className="header-right">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              className="search-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* Wishlist & Bag after the search bar */}
          <button className="link-button header-link">
            WISHLIST ({wishlistCount})
          </button>
          <button className="link-button header-link">
            BAG ({bagCount})
          </button>
        </div>
      </header>

      {/* Categories line under header */}
      <nav className="category-bar">
        <button
          className={`category-pill ${
            selectedCategory === "" ? "active" : ""
          }`}
          onClick={() => loadByCategory("")}
        >
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => loadByCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Sort + count */}
      <div className="content-header">
        <div>
          <h1 className="page-title">NEW ARRIVALS</h1>
          <p className="subtitle">
            {products.length} items
            {selectedCategory ? ` · ${selectedCategory}` : ""}
          </p>
        </div>

        <div>
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products */}
      {loading && <div className="status">Loading products...</div>}
      {error && <div className="status error">{error}</div>}

      {!loading && !error && (
        <main
          className={`products-grid ${
            selectedCategory ? "products-grid-compact" : ""
          }`}
        >
          {products.map((p) => {
            const mainImage =
              Array.isArray(p.images) && p.images.length > 0
                ? p.images[0]
                : "https://via.placeholder.com/600x800?text=No+Image";

            return (
              <article
                key={p.id}
                className="product-card"
                onClick={() => handleCardClick(p.id)}
              >
                <div className="product-image-wrap">
                  <img
                    src={mainImage}
                    alt={p.name}
                    className="product-image"
                  />
                </div>

                <div className="product-info">
                  <p className="product-brand">
                    {p.category || "Collection"}
                  </p>
                  <h2 className="product-name">{p.name}</h2>

                  <div className="product-meta">
                    {p.color && <span>{p.color}</span>}
                    {p.size && <span>Size: {p.size}</span>}
                  </div>

                  <p className="product-price">{formatPrice(p.price)}</p>
                </div>
              </article>
            );
          })}
        </main>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} mimi</span>
        <span>Inspired by FWRD</span>
      </footer>
    </div>
  );
}

export default App;
