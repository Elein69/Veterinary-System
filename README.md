# 🐾 Distributed Veterinary Management System (Microservices)

## 🏗️ Project Architecture
This project is a high-scale, distributed system built with **NestJS**, demonstrating advanced communication patterns between 10 specialized microservices.

### 🛠️ Technology Stack
- **Framework:** NestJS (Node.js)
- **Communication:** REST, RabbitMQ (RPC), Apache Kafka (Event-Driven), MQTT (IoT).
- **Documentation:** Swagger / OpenAPI.
- **Environment:** Docker (Kafka & RabbitMQ Brokers).

## 🧩 Microservices Directory

| Service | Port | Primary Protocol | Responsibility |
| :--- | :--- | :--- | :--- |
| **Identity** | 3001 | HTTP / RabbitMQ | Auth & User Validation |
| **Patient** | 3002 | HTTP | Pet & Owner Records |
| **Medical** | 3003 | HTTP | Clinical History & Prescriptions |
| **IoT** | 3004 | HTTP / MQTT | Real-time Vitals Monitoring |
| **Appointment**| 3005 | HTTP / Kafka | Orchestrator & Scheduling |
| **Billing** | 3006 | Kafka Consumer | Automatic Invoicing |
| **Inventory** | 3007 | HTTP / Kafka | Pharmaceutical Stock Management |
| **Notification**| 3008 | Kafka Consumer | Email & Alert Dispatcher |
| **Staff** | 3009 | HTTP / RabbitMQ | Medical Team & Availability |
| **Audit** | N/A | Kafka Consumer | Global Security & Event Logging |

## 🚀 Getting Started

1. **Infrastructure:** Ensure Docker is running with Kafka and RabbitMQ.
2. **Installation:**
   ```bash
   npm install
3. **Running Services: Launch each** service using:
 ```bash
    npx nest start <service-name> --watch

🛡️ Audit & Security

The system implements a Centralized Audit Log pattern. Every critical action (Billing, Inventory movement, Staff changes) is captured by the Audit Service via Kafka, ensuring full system traceability and eventual consistency.

