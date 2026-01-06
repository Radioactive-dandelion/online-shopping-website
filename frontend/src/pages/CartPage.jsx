import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import '../App.css';

function formatPrice(priceTRY) {
  return `${priceTRY.toFixed(0)} ₺`;
}

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity);
    if (isNaN(qty) || qty < 0) return;
    updateQuantity(productId, qty);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setProcessingCheckout(true);
    setTimeout(() => {
      navigate('/checkout');
      setProcessingCheckout(false);
    }, 500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <header className="main-header">
          <div className="header-left">
            <button className="link-button" onClick={() => navigate('/')}>WOMEN</button>
          </div>
          <div className="header-center">
            <button className="logo logo-button" onClick={() => navigate('/')}>mimi</button>
          </div>
          <div className="header-right">
            <button className="link-button" onClick={() => navigate('/cart')}>BAG (0)</button>
          </div>
        </header>
        <main className="cart-empty">
          <h1>Your bag is empty</h1>
          <p>Add some items to get started!</p>
          <button className="primary-button" onClick={() => navigate('/')}>Continue Shopping</button>
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} mimi</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="main-header">
        <div className="header-left">
          <button className="link-button" onClick={() => navigate('/')}>WOMEN</button>
        </div>
        <div className="header-center">
          <button className="logo logo-button" onClick={() => navigate('/')}>mimi</button>
        </div>
        <div className="header-right">
          <button className="link-button" onClick={() => navigate('/cart')}>BAG ({getTotalItems()})</button>
        </div>
      </header>

      <main className="cart-page">
        <h1 className="cart-title">Shopping Bag</h1>
        <div className="cart-layout">
          <section className="cart-items">
            {cartItems.map(item => {
              const itemImage = Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : 'https://via.placeholder.com/150?text=No+Image';

              return (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-image" onClick={() => navigate(`/product/${item.id}`)}>
                    <img src={itemImage} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <p className="cart-item-category">{item.category || 'Collection'}</p>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <div className="cart-item-meta">
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                        {item.sku && <p>SKU: {item.sku}</p>}
                      </div>
                      <p className="cart-item-price">{formatPrice(item.price)}</p>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-selector">
                        <label>Quantity:</label>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                          <input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                    <div className="cart-item-subtotal">
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-line">
              <span>Subtotal ({getTotalItems()} items)</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-line summary-total">
              <strong>Total</strong>
              <strong>{formatPrice(getTotalPrice())}</strong>
            </div>
            <button className="primary-button checkout-button" onClick={handleCheckout} disabled={processingCheckout}>
              {processingCheckout ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            <button className="link-button" onClick={() => navigate('/')} style={{ marginTop: '1rem', width: '100%' }}>
              Continue Shopping
            </button>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} mimi</span>
      </footer>
    </div>
  );
}

export default CartPage;