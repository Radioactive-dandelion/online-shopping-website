# User Service (Authentication + Profile Management)
This microservice is responsible for user registration, login, authentication, profile management, avatar uploads, and user preferences.
It is part of a microservices-based online shopping platform.

# Features:
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

# Tech Stack:

*Layer*	         *Technology*
Backend	         Node.js, Express
DB	             MySQL
Auth	         JWT + cookies
Uploads	         Multer
Frontend	     React + Vite
Container	     Docker, Docker Compose

# Requirements:
- Node.js 18+
- MySQL 8+
- Docker (optional but recommended)

# Project Structure
user-service/
│  README.md
│  docker-compose.yml
│
├── server/
│     server.js
│     Dockerfile
│     uploads/
│
├── frontend/
│     src/
│     Dockerfile
│     package.json
│     README.md
│
└── tests/

# Running with Docker Compose
1. Build + start all containers: docker compose up --build
2. Containers included
Service	    Port	Description
MySQL	    3306	User DB
Backend	    8081	API server
Frontend	5173	React UI
3. Stop all containers: docker compose down

# Environment Variables
Create /server/.env:

JWT_SECRET=jwt-secret-key
MYSQL_HOST=mysql
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=signup

# Tests
Tests use Jest + Supertest.
Install test dependencies: npm install --save-dev jest supertest
Run tests: npm test

# API Endpoints
Method	Route	                 Description
POST	/register	             create user
POST	/login	                 login + set cookie
POST	/logout	                 remove cookie
GET	    /	                     verify JWT
GET	    /profile	             get profile
PUT	    /profile	             update profile
PUT	    /profile/password	     change password
PUT	    /profile/preferences	 update preferences
POST	/profile/avatar	upload   avatar
POST	/profile/avatar/remove	 remove avatar
