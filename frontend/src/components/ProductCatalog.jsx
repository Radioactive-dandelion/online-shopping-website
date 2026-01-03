import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_URL;

function formatPrice(priceTRY) {
  return `${priceTRY.toFixed(0)} ₺`;
}

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("featured");

  const navigate = useNavigate();

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
    if (option === "price_low") copy.sort((a, b) => a.price - b.price);
    if (option === "price_high") copy.sort((a, b) => b.price - a.price);
    return copy;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(buildListUrl(""));
        const data = await res.json();
        setProducts(sortProducts(data, sortOption));

        const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
        setAllCategories(cats);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="page">
      <header className="main-header">
        <button className="logo" onClick={() => window.location.reload()}>
          mimi
        </button>
      </header>

      <nav className="category-bar">
        <button onClick={() => setSelectedCategory("")}>All</button>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
      </nav>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <main className="products-grid">
        {products.map(p => (
          <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
            <img src={p.images?.[0]} alt={p.name} />
            <h3>{p.name}</h3>
            <p>{formatPrice(p.price)}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default ProductCatalog;
