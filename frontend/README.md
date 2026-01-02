Overview
This folder contains the frontend application for the Online Shopping Website.
The frontend is built with React and provides the user interface for interacting with the platform, including authentication, user profile management, product browsing, and order-related pages.
The frontend communicates with backend microservices via the API Gateway (or directly with services during development).

Technologies Used:
React (Vite)
JavaScript (ES6+)
React Router
Axios
Bootstrap
Docker

Environment Variables
The frontend uses environment variables defined in a .env file.

API Communication
All HTTP requests are handled using Axios.
A centralized Axios instance is located in: src/api/axios.js

Running the Frontend Locally
Install dependencies: npm install
Start development server: npm run dev
The application will be available at: http://localhost:5173

Running with Docker
The frontend is containerized and can be started using Docker Compose from the project root: docker compose up --build

User Features
User registration and login
Authentication with cookies
User profile management
User preferences (theme, language, currency, notifications)
Avatar upload and removal
Navigation between services (products, orders)

Role in the System
The frontend serves as a single user interface for all backend microservices:
User Service
Product Service
Order Service
It does not contain business logic - all data processing is handled by backend services.

Future Improvements
Improved UI/UX design
Global state management (Redux / Context API)
Form validation improvements
Internationalization (i18n)
Better error handling and loading states