import React, { createContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "./api/axios";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import ProductPage from "./pages/products/ProductPage";

export const AuthContext = createContext();

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    name: "",
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/");
        if (res.data.status === "Success") {
          setAuth({ isAuthenticated: true, name: res.data.name, loading: false });
        } else {
          setAuth({ isAuthenticated: false, name: "", loading: false });
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setAuth({ isAuthenticated: false, name: "", loading: false });
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async (navigate) => {
    try {
      await axios.post("/logout");
      setAuth({ isAuthenticated: false, name: "", loading: false });
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, handleLogout }}>
      <Routes>
        {/* Product */}
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
