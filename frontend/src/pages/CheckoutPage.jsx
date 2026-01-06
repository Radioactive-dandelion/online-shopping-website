import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import '../App.css';

const ORDER_SERVICE_URL = `${process.env.API_BASE}/orders`;


function formatPrice(priceTRY) {
  return `${priceTRY.toFixed(0)} ₺`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    // User info (in real app, get from authentication)
    email: '',
    fullName: '',
    phone: '',
    
    // Shipping address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Turkey',
    
    // Payment info (simplified for demo)
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.fullName || !formData.address) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Prepare order data for Order Service
      const orderData = {
        userId: 1, // TODO: Get from authenticated user
        userEmail: formData.email,
        userName: formData.fullName,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        billingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category || '',
          productSku: item.sku || '',
          productColor: item.color || '',
          productSize: item.size || '',
          productDescription: item.description || '',
          unitPrice: item.price,
          quantity: item.quantity
        }))
      };

      // Send order to Order Service
      const response = await fetch(ORDER_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      // Order created successfully
      setOrderId(result.id);
      setOrderSuccess(true);
      
      // Clear cart
      clearCart();

    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="page">
        <header className="main-header">
          <div className="header-center">
            <button className="logo logo-button" onClick={() => navigate('/')}>
              mimi
            </button>
          </div>
        </header>
        <main className="checkout-empty">
          <h1>Your cart is empty</h1>
          <button className="primary-button" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </main>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="page">
        <header className="main-header">
          <div className="header-center">
            <button className="logo logo-button" onClick={() => navigate('/')}>
              mimi
            </button>
          </div>
        </header>
        
        <main className="order-success">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order.</p>
          <p className="order-number">Order #{orderId}</p>
          <p>A confirmation email will be sent to {formData.email}</p>
          
          <div className="success-actions">
            <button className="primary-button" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
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
          <button className="link-button" onClick={() => navigate('/cart')}>
            ← Back to Cart
          </button>
        </div>
        <div className="header-center">
          <button className="logo logo-button" onClick={() => navigate('/')}>
            mimi
          </button>
        </div>
      </header>

      <main className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-layout">
          {/* Checkout Form */}
          <section className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="form-section">
                <h2>Contact Information</h2>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+90 555 123 4567"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h2>Shipping Address</h2>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h2>Payment Information</h2>
                <p className="payment-note">
                  Note: This is a demo. Payment processing is simulated.
                </p>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cardCVV"
                      value={formData.cardCVV}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="primary-button submit-order-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Place Order - ${formatPrice(getTotalPrice())}`}
              </button>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cartItems.map(item => {
                const itemImage = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : 'https://via.placeholder.com/80?text=No+Image';

                return (
                  <div key={item.id} className="checkout-item">
                    <img src={itemImage} alt={item.name} />
                    <div className="checkout-item-details">
                      <p className="checkout-item-name">{item.name}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="summary-totals">
              <div className="summary-line">
                <span>Subtotal</span>
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
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} mimi</span>
      </footer>
    </div>
  );
}

export default CheckoutPage;