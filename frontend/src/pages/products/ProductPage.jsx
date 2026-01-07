import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../App.css";

const API_BASE = import.meta.env.VITE_API_URL;

function formatPrice(priceTRY) {
  return `${priceTRY.toFixed(0)} ₺`;
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionStatus, setActionStatus] = useState("");

  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : ["https://via.placeholder.com/900x500?text=No+Image"];

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setActionStatus("");

        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const data = await res.json();
        setProduct(data);
        setCurrentImageIndex(0);

        if (data.category) {
          const params = new URLSearchParams();
          params.append("category", data.category);
          params.append("limit", 8);
          const relRes = await fetch(`${API_BASE}/products?${params.toString()}`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelated(relData.filter((p) => p.id !== data.id));
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToWishlist = () => setActionStatus("Added to wishlist (demo only)");
  const handleAddToBag = () => setActionStatus("Added to bag (demo only)");

  if (loading) return <div className="page status">Loading product...</div>;
  if (error || !product)
    return (
      <div className="page status error">
        {error || "Product not found"}
        <div style={{ marginTop: "1rem" }}>
          <button className="link-button" onClick={() => navigate("/")}>
            Back to shop
          </button>
        </div>
      </div>
    );

  const mainImage = images[currentImageIndex];
  const goPrev = () => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  const goNext = () => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);

  return (
    <div className="page">
      <header className="main-header">
        <div className="header-center">
          <button className="logo logo-button" onClick={() => navigate("/")}>mimi</button>
        </div>
      </header>

      <main className="product-layout fw-product-layout">
        <section className="product-gallery fw-gallery">
          {images.length > 1 && (
            <>
              <button className="gallery-arrow left" onClick={goPrev}>‹</button>
              <button className="gallery-arrow right" onClick={goNext}>›</button>
            </>
          )}
          <div className="product-main-image-wrap fw-main-image-wrap">
            <img src={mainImage} alt={product.name} className="product-main-image fw-main-image" />
          </div>
          <div className="image-count">{currentImageIndex + 1} / {images.length}</div>
        </section>

        <section className="product-detail-panel fw-detail-panel">
          <p className="product-category-detail">{product.category || "Collection"}</p>
          <h1 className="product-title-detail">{product.name}</h1>
          <p className="product-price-detail">{formatPrice(product.price)}</p>

          <div style={{ marginTop: "1rem" }}>
            <button className="primary-button" onClick={handleAddToBag}>Add to bag</button>
            <button className="link-button" style={{ marginLeft: "1rem" }} onClick={handleAddToWishlist}>♡ Add to wishlist</button>
            {actionStatus && <p className="status" style={{ marginTop: "0.6rem" }}>{actionStatus}</p>}
          </div>
        </section>
      </main>

      {related.length > 0 && (
        <section className="related-section fw-related-section">
          <h2 className="related-title">You may also like</h2>
          <div className="fw-related-grid">
            {related.map((p) => {
              const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "https://via.placeholder.com/400x200?text=No+Image";
              return (
                <article key={p.id} className="fw-related-card" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className="fw-related-image-wrap"><img src={img} alt={p.name} /></div>
                  <p className="fw-related-brand">{p.category || "Collection"}</p>
                  <p className="fw-related-name">{p.name}</p>
                  <p className="fw-related-price">{formatPrice(p.price)}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;

