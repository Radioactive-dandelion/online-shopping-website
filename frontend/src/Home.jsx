import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "./api/axios";
import "./App.css";

function Home() {
  const [auth, setAuth] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/");
        if (res.data?.status === "Success") {
          setAuth(true);
          setName(res.data.name);
        } else {
          setAuth(false);
        }
      } catch (err) {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Эффект для автоматического скрытия сообщения через 5 секунды
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        
        const hideTimer = setTimeout(() => {
          setShowMessage(false);
        }, 500);

        return () => clearTimeout(hideTimer);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) return <div className="home-loading">Loading...</div>;

  return (
    <div className="home-container">
      {showMessage && (
        <div className={`home-message ${fadeOut ? 'fade-out' : 'fade-in'}`}>
          {auth ? (
            <div className="welcome-message">
              <h3>Welcome, {name}!</h3>
              <p>You are logged in.</p>
              <Link to="/profile" className="home-btn">
                Go to Profile
              </Link>
            </div>
          ) : (
            <div className="unauthorized-message">
              <h3>You are not authorized</h3>
              <p>Please log in to continue</p>
              <Link to="/login" className="home-btn login-btn">
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;