import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

/**
 * USER SERVICE
 * http://localhost:8081
 */
app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://user-backend:8081",
    changeOrigin: true
  })
);

/**
 * PRODUCT SERVICE
 * http://localhost:8000
 */
app.use(
  "/api/products",
  createProxyMiddleware({
    target: "http://product-service:8000",
    changeOrigin: true
  })
);

/**
 * ORDER SERVICE (если есть)
 */
// app.use(
//   "/api/orders",
//   createProxyMiddleware({
//     target: "http://order-service:9000",
//     changeOrigin: true
//   })
// );

app.get("/", (req, res) => {
  res.send("API Gateway is running");
});

app.listen(8080, () => {
  console.log("API Gateway running on port 8080");
});
