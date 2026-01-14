# 📧 Notification Service

## Overview
The **Notification Service** acts as the communication layer of the distributed system. It operates asynchronously using the **Fan-Out pattern**, listening to domain events to trigger emails and SMS alerts to pet owners.

## Architecture
- **Type:** Hybrid Microservice (Kafka Consumer + HTTP)
- **Port:** 3008
- **Transport:** Apache Kafka
- **Consumer Group:** `notification-consumer`

## Event-Driven Workflow
1. **Event Source:** `Appointment Service` or `Billing Service`.
2. **Event Topic:** `crear_factura` (Simulated event chain).
3. **Action:** Logs the event and simulates sending an email (SMTP/SendGrid integration ready).

## API & Diagnostics
Access service status at: `http://localhost:3008/docs`

## Running the Service
```bash
npx nest start notification-service --watch