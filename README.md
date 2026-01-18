**WorkLedger — Multi-Tenant SaaS Platform (Java, Spring Boot)**


An enterprise-grade Multi-Tenant SaaS Backend Platform built using Java 17, Spring Boot, PostgreSQL, JWT Security, Docker, and Microservices Architecture.
Designed to demonstrate real-world backend engineering practices such as tenant isolation, secure authentication, scalability, and clean architecture.

👨‍💻 Author

Pandey Narayani
Aspiring Backend Engineer | Java | Spring Boot | Microservices

📌 Project Overview

This platform enables multiple companies (tenants) to use a single SaaS application while ensuring:

Complete data isolation

Secure authentication & authorization

High scalability

Modular microservices architecture

Production-style deployment using Docker

Each tenant experiences the system as if they have their own private backend, even though the infrastructure is shared.

🧠 Real-World Use Cases

This architecture is suitable for platforms such as:

CRM Systems

ERP Systems

Project Management Tools

Inventory Management Systems

HR Platforms

Billing Systems

Real-world inspirations include platforms like Zoho, Freshworks, Salesforce, and Notion Teams.

🏗️ High-Level Architecture
Client (Web/Mobile)
        ↓
     API Gateway
        ↓
-------------------------------------------------
| Auth Service | Tenant Service | Core Service  |
-------------------------------------------------
        ↓
     PostgreSQL (Schema-per-tenant)
        ↓
Notification Service (Async Events)

📂 Project Structure
saas-platform/
│
├── api-gateway/          → Entry point, JWT validation, routing
├── auth-service/         → Login, JWT, refresh tokens
├── tenant-service/       → Tenant creation, schema provisioning
├── core-service/         → Business logic (users, projects, reports)
├── notification-service/ → Async email/event handling
├── common-lib/           → Shared DTOs, utilities, exceptions
│
├── docker-compose.yml
└── README.md

🧩 Microservices Responsibilities
🔐 API Gateway

JWT validation

Tenant extraction

Request routing

Rate limiting

Centralized security

🔑 Auth Service

Login

Refresh token

Logout

JWT generation

Password hashing

🧱 Tenant Service (Core Feature)

Tenant onboarding

Schema creation per tenant

Auto-provisioning of tables

Stores tenant metadata

🧠 Core Service

Business APIs (Users, Projects, Reports)

RBAC (Role-Based Access Control)

Pagination

Audit logging

Optimistic locking

📩 Notification Service

Asynchronous processing

Email notifications

Event-driven architecture (Kafka/RabbitMQ ready)

🗄️ Database Design (Schema-per-Tenant)
Master Schema

Stores system-level metadata:

tenants

tenant_id

company_name

schema_name

status

Tenant Schemas

Each tenant has its own isolated schema:

users

roles

user_roles

projects

audit_logs

Example:

tenant_abc.users  
tenant_xyz.projects  


✅ No tenant data can ever leak between schemas.

🔐 Authentication & Tenant Flow
Login Flow

User logs in with email + password

Auth Service validates credentials

JWT generated:

{
  "userId": "123",
  "tenantId": "tenant_abc",
  "role": "ADMIN"
}


JWT returned to client

Stateless authentication (no server sessions)

🔄 Request Lifecycle (Critical Concept)
Client → API Gateway → Core Service → Database


Internally:

API Gateway validates JWT

Extracts tenantId

Core Service stores tenantId in ThreadLocal

Hibernate dynamically switches schema

Query runs only inside the tenant schema

Response returned safely

🔒 Strong tenant isolation guaranteed

🛡️ Authorization (RBAC)

Implemented using Spring Security.

Roles:

ADMIN

MANAGER

USER

Access is controlled using:

Method-level security

Route-level security

⚙️ Async Processing

Handled by Notification Service:

Email sending

Audit events

Reporting

Background jobs

Enables:

Better performance

Non-blocking APIs

Event-driven scalability

📊 Scalability Strategy
Layer	Scaling Approach
API Gateway	Horizontal scaling
Services	Stateless → Easy to scale
Database	Read replicas
Caching	Redis (optional)
Messaging	Kafka / RabbitMQ
🐳 Running with Docker

Start all services using:

docker-compose up --build


Services included:

PostgreSQL

API Gateway

Auth Service

Tenant Service

Core Service

Notification Service

🧪 Testing Strategy
src/test/java/
├── controller/     → API tests
├── service/        → Business logic tests
└── integration/    → End-to-end tenant flow tests


Integration tests validate:

Tenant isolation works correctly across requests.
