# 🚀 WorkLedger — Multi-Tenant SaaS Backend Platform

An enterprise-style **multi-tenant SaaS backend platform** built with **Java 17, Spring Boot, PostgreSQL, JWT, Docker, and Microservices Architecture**.  
Designed to demonstrate real-world backend engineering practices including **tenant isolation, secure authentication, scalability, and clean architecture**.

---

## 👩‍💻 Author
**Narayani Pandey**  
Java Backend Developer | Spring Boot | Microservices  
[LinkedIn](#) | [GitHub](#)

---

## 📌 Project Overview

WorkLedger is a backend platform where **multiple organizations (tenants)** can securely share the same infrastructure while maintaining **complete data isolation**.

Each tenant experiences the system as if they have their own private backend.

This project demonstrates:
- Secure authentication & authorization
- Schema-level tenant isolation
- Microservices architecture
- Production-style deployment using Docker
- Scalable and modular backend design

---

## 🧠 Real-World Use Cases

This architecture is suitable for:
- CRM systems  
- ERP platforms  
- Project management tools  
- Inventory systems  
- HR platforms  
- Billing & SaaS products  

Inspired by platforms like **Zoho, Salesforce, Freshworks, Notion Teams**.

---

## 🏗️ Architecture Overview

Client (Web/Mobile)  
↓  
API Gateway  
↓  
Auth Service | Tenant Service | Core Service  
↓  
PostgreSQL (Schema-per-tenant)  
↓  
Notification Service (Async events)

---

## 📂 Project Structure

saas-platform/
│
├── api-gateway/ → JWT validation, routing, security
├── auth-service/ → Login, JWT, refresh tokens
├── tenant-service/ → Tenant onboarding, schema provisioning
├── core-service/ → Business logic (users, projects, reports)
├── notification-service/→ Async processing, email/events
├── common-lib/ → Shared DTOs, exceptions, utilities
├── docker-compose.yml
└── README.md


---

## 🔐 Security Features

- JWT-based authentication  
- Role-Based Access Control (RBAC)  
- Password hashing  
- Route-level and method-level security  
- Stateless authentication  
- Strict tenant isolation  

JWT example payload:
```json
{
  "userId": "123",
  "tenantId": "tenant_abc",
  "role": "ADMIN"
}
🧱 Multi-Tenancy Design (Core Feature)
Uses schema-per-tenant architecture:

Master schema:

tenants

tenant_id

company_name

schema_name

status

Tenant schemas:

tenant_abc.users

tenant_xyz.projects

✔ Ensures no data leakage between tenants
✔ Dynamic schema switching using Hibernate + ThreadLocal context

⚙️ Key Features Implemented
Multi-tenant onboarding with schema auto-provisioning

Spring Security with JWT & RBAC

API Gateway for centralized validation and routing

Microservices architecture

Dockerized deployment using docker-compose

Integration testing for tenant isolation

Clean layered architecture (Controller, Service, Repository)

Production-style project structure

🐳 Run Locally with Docker
docker-compose up --build
This starts:

PostgreSQL

API Gateway

Auth Service

Tenant Service

Core Service

Notification Service

🧪 Testing Strategy
Tests are organized under:

src/test/java/
├── controller/   → API tests
├── service/      → Business logic tests
└── integration/  → End-to-end tenant flow tests
Integration tests verify:
✔ Tenant isolation
✔ Auth flow
✔ Secure request lifecycle

📈 What This Project Demonstrates
Strong Java + Spring Boot fundamentals

Backend architecture thinking

Security best practices

Microservices design

Docker & deployment understanding

Real-world SaaS concepts

Scalable backend system design

📬 Feedback & Contributions
This is a learning-focused project.
Suggestions and feedback are welcome.

⭐ If you found this project valuable, feel free to star the repository!


