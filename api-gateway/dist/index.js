"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// In Docker: http://product-service:8000
// Local (no Docker): set env PRODUCT_SERVICE_URL=http://localhost:8000
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:8000";

app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "api-gateway" });
});
// ------------------------
// PRODUCT ROUTES
// ------------------------
// List all products
app.get("/api/products", async (req, res) => {
    try {
        const response = await axios_1.default.get(`${PRODUCT_SERVICE_URL}/products`, // ⬅️ CHANGED
        { params: req.query });
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (list):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// Search products
app.get("/api/products/search", async (req, res) => {
    try {
        const response = await axios_1.default.get(`${PRODUCT_SERVICE_URL}/products/search`, // ⬅️ CHANGED
        { params: req.query });
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (search):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios_1.default.get(`${PRODUCT_SERVICE_URL}/products/${id}` // ⬅️ CHANGED
        );
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (get by id):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// Create product
app.post("/api/products", async (req, res) => {
    try {
        const response = await axios_1.default.post(`${PRODUCT_SERVICE_URL}/products`, // ⬅️ CHANGED
        req.body);
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (create):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// Update product
app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios_1.default.put(`${PRODUCT_SERVICE_URL}/products/${id}`, // ⬅️ CHANGED
        req.body);
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (update):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// Delete product
app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios_1.default.delete(`${PRODUCT_SERVICE_URL}/products/${id}` // ⬅️ CHANGED
        );
        res.status(response.status).json(response.data || {});
    }
    catch (err) {
        console.error("Error calling Product Service (delete):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
// ⚠️ These two will still 404 unless you add matching routes in FastAPI:
app.get("/api/products/categories", async (req, res) => {
    try {
        const response = await axios_1.default.get(`${PRODUCT_SERVICE_URL}/products/categories` // needs backend route
        );
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (categories):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
app.get("/api/products/featured", async (req, res) => {
    try {
        const response = await axios_1.default.get(`${PRODUCT_SERVICE_URL}/products/featured`, // needs backend route
        { params: req.query });
        res.status(response.status).json(response.data);
    }
    catch (err) {
        console.error("Error calling Product Service (featured):", err.message);
        res
            .status(err.response?.status || 500)
            .json(err.response?.data || { detail: "Product service unavailable" });
    }
});
app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
    console.log(`Forwarding Product routes to: ${PRODUCT_SERVICE_URL}`);
});
