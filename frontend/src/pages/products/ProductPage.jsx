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

  // all images (fallback to placeholder)
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
          const relRes = await fetch(
            `${API_BASE}/products?${params.toString()}`
          );
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

  // dummy handlers: just show a message, no backend
  const handleAddToWishlist = () => {
    setActionStatus("Added to wishlist (demo only)");
  };

  const handleAddToBag = () => {
    setActionStatus("Added to bag (demo only)");
  };

  if (loading) {
    return <div className="page status">Loading product...</div>;
  }

  if (error || !product) {
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
  }

  const mainImage = images[currentImageIndex];

  const goPrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="page">
      {/* Simple top bar */}
      <div className="top-utility-bar">
        <div className="utility-left" />
        <div className="utility-right">
          <button className="link-button">LOGIN</button>
        </div>
      </div>

      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <button className="link-button" onClick={() => navigate("/")}>
            WOMEN
          </button>
        </div>

        <div className="header-center">
          <button
            className="logo logo-button"
            type="button"
            onClick={() => navigate("/")}
          >
            mimi
          </button>
        </div>

        <div className="header-right" />
      </header>

      {/* Product layout */}
      <main className="product-layout fw-product-layout">
        {/* LEFT: image gallery */}
        <section className="product-gallery fw-gallery">
          {images.length > 1 && (
            <button
              className="gallery-arrow left"
              type="button"
              onClick={goPrev}
            >
              ‹
            </button>
          )}

          <div className="product-main-image-wrap fw-main-image-wrap">
            <img
              src={mainImage}
              alt={product.name}
              className="product-main-image fw-main-image"
            />
          </div>

          {images.length > 1 && (
            <button
              className="gallery-arrow right"
              type="button"
              onClick={goNext}
            >
              ›
            </button>
          )}

          <div className="image-count">
            {currentImageIndex + 1} / {images.length}
          </div>
        </section>

        {/* RIGHT: product details */}
        <section className="product-detail-panel fw-detail-panel">
          <p className="product-category-detail">
            {product.category || "Collection"}
          </p>
          <h1 className="product-title-detail">{product.name}</h1>

          <p className="product-price-detail">
            {formatPrice(product.price)}
          </p>

          <div className="product-meta-detail">
            {product.color && <p>Color: {product.color}</p>}
            {product.size && <p>Size: {product.size}</p>}
            {product.sku && <p>SKU: {product.sku}</p>}
          </div>

          {product.description && (
            <p className="product-description-detail">
              {product.description}
            </p>
          )}

          {/* Dummy Bag + wishlist buttons + status */}
          <div style={{ marginTop: "1rem" }}>
            <button
              className="primary-button"
              type="button"
              onClick={handleAddToBag}
            >
              Add to bag
            </button>

            <button
              type="button"
              className="link-button"
              style={{ marginLeft: "1rem" }}
              onClick={handleAddToWishlist}
            >
              ♡ Add to wishlist
            </button>

            {actionStatus && (
              <p className="status" style={{ marginTop: "0.6rem" }}>
                {actionStatus}
              </p>
            )}
          </div>

          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className="external-link"
            >
              View full details on brand site
            </a>
          )}
        </section>
      </main>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="related-section fw-related-section">
          <h2 className="related-title">You may also like</h2>
          <div className="fw-related-grid">
            {related.map((p) => {
              const img =
                Array.isArray(p.images) && p.images.length > 0
                  ? p.images[0]
                  : "https://via.placeholder.com/400x200?text=No+Image";

              return (
                <article
                  key={p.id}
                  className="fw-related-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="fw-related-image-wrap">
                    <img src={img} alt={p.name} />
                  </div>
                  <p className="fw-related-brand">
                    {p.category || "Collection"}
                  </p>
                  <p className="fw-related-name">{p.name}</p>
                  <p className="fw-related-price">
                    {formatPrice(p.price)}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} mimi</span>
        <span>Inspired by FWRD</span>
      </footer>
    </div>
  );
}

export default ProductPage;
