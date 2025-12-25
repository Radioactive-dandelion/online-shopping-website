User Service (Authentication + Profile Management)
This microservice is responsible for user registration, login, authentication, profile management, avatar uploads, and user preferences.
It is part of a microservices-based online shopping platform.

Features:
- User registration
- Login with JWT authentication
- Secure password hashing (bcrypt)
- JWT stored in HTTP-only cookies
- User profile system
- Avatar upload (multer + static hosting)
- User preferences: (Theme (dark/light), Language, Currency, Email notifications)
- Change password
- Logout
- Fully containerized with Docker
- MySQL database

Tech Stack:

*Layer*	         *Technology*
Backend	         Node.js, Express
DB	             MySQL
Auth	         JWT + cookies
Uploads	         Multer
Frontend	     React + Vite
Container	     Docker, Docker Compose

Requirements:
- Node.js 18+
- MySQL 8+
- Docker (optional but recommended)

