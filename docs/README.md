Online Shopping Website – Microservice-Based Application
Overview
This project presents a prototype of an online store built using a microservice architecture. The system is divided into several independent services, each responsible for a specific business domain. This approach improves modularity, scalability, and maintainability, and reflects modern web application development practices.

The application includes:

A frontend web application for user interaction
An API Gateway for request routing
Backend microservices for user management, product management, and order processing
Databases and supporting technologies for persistent storage and search
All services are containerized using Docker and orchestrated with Docker Compose, allowing the entire system to run in a consistent and reproducible environment.

System Architecture
High-level architecture:

Frontend (React) communicates with backend services via the API Gateway
API Gateway routes requests to the appropriate microservice
Each microservice has its own database and business logic
Services communicate using REST APIs over HTTP, exchanging data in JSON format
This loose coupling allows services to be developed, deployed, and modified independently.

Services Description
Service 1 – User Service (Node.js / Express)
Function / Role

Manages user accounts and authentication
Supports user registration and login
Handles user profile management and preferences
Provides secure session and authentication handling
Tools / Libraries Used

Node.js + Express
MySQL
JSON Web Tokens (JWT)
HTTP-only cookies
Multer (file uploads)
Docker & Docker Compose
Implementation Notes

Exposes REST API endpoints such as /register, /login, /logout, and /profile
JWT is used for authentication and session validation
MySQL stores user credentials, profile data, and preferences
Multer handles avatar image uploads
Returns JSON responses to the API Gateway or frontend
Service 2 – Product Service (Python / FastAPI)
Function / Role

Manages product data
Supports product creation, retrieval, update, and deletion (CRUD)
Provides product search and filtering functionality
Tools / Libraries Used

Python
FastAPI
PostgreSQL
Elasticsearch
Docker & Docker Compose
Implementation Notes

REST API endpoints expose product-related operations
PostgreSQL is used for structured product data storage
Elasticsearch enables efficient full-text search and filtering
Data is exchanged in JSON format
Service 3 – Order Service (Java / Spring Boot)
Function / Role

Manages user orders and their lifecycle
Create, retrieve, update, validate, pay for, and cancel orders
Handles payment logic (mock or basic implementation)
Provides order history and user order statistics
Tools / Libraries Used

Java
Spring Boot
MySQL
JPA / Hibernate
Maven
Actuator, Lombok
Docker & Docker Compose
Implementation Notes

Implements REST API endpoints for order management
Uses JPA for database interaction and persistence
MySQL stores order data and related entities
Exposes JSON-based APIs for interaction via the API Gateway
Frontend Application
Technology

JavaScript
React
Vite
Key UI Components

Main page with product listings
Product details page
Shopping cart
Checkout page
User authentication and profile pages
The frontend communicates exclusively with the backend via the API Gateway and dynamically updates the UI without page reloads.

Communication Between Services
Communication follows the REST architectural style over HTTP
All data is exchanged in JSON format
Examples:

Frontend authenticates users via the User Service
Order Service requests user data to associate orders with users
Product Service provides product data for display and order creation
This loose coupling enables independent development and scalability of each service.

Deployment
All services are containerized using Docker
Docker Compose is used to define and run the multi-container application
Services communicate over a shared Docker network
Databases are persisted using Docker volumes
Testing
Due to time constraints, comprehensive testing was limited. However, the following testing strategies are applicable:

Unit Testing

Testing individual service methods
Validating business logic
Error and exception handling
Integration Testing

Testing REST API endpoints
Verifying database interactions
End-to-End Testing

Simulating user workflows (browse products, add to cart, place order)
Testing interactions between all services
Future Improvements
Possible areas for further development include:

Adding a dedicated payment service
Implementing role-based access control
Performance optimization using caching
Improving service integration and testing coverage
Further enhancement of the user interface
Conclusion
This project demonstrates the practical application of microservice architecture in building an online store. It provides hands-on experience in designing, implementing, containerizing, and integrating distributed services using modern backend and frontend technologies.
