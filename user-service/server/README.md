# User Service Backend

# Description

This folder contains the backend implementation of the User Service.
It is built with Node.js and Express and provides REST API endpoints for authentication and user management.

---

# Requirements

- Node.js 18+
- MySQL 8+
- Docker (optional but recommended)

---

# Environment Variables

Create a `.env` file inside this folder (`user-service/server/.env`) with the following variables:

DB_HOST=mysql
DB_USER=root
DB_PASSWORD=password
DB_NAME=signup

JWT_SECRET=jwt-secret-key
CLIENT_URL=http://localhost:5173

---

# Running Without Docker

1. Install dependencies:
```bash
npm install
Start the server:

2. Start the server:
npm start
The server will run on: http://localhost:8081


# Running With Docker
From the user-service root directory:
docker-compose up --build

This will start:
- User Service backend
- MySQL database

# API Overview
Main endpoints:
POST /register — user registration
POST /login — user login
POST /logout — logout
GET /profile — get user profile
PUT /profile — update profile
POST /upload-avatar — upload avatar
PUT /change-password — change password
All protected routes require a valid JWT stored in cookies.

# Testing
To run tests:
npm test

Tests include:
Unit tests (JWT, password hashing, middleware)
Integration tests (authentication routes)

# Notes:
JWT is stored in HTTP-only cookies for security.
Uploaded avatars are stored locally and served as static files.
This service is designed to be used behind an API Gateway.