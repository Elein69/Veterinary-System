# 💰 Billing Service

## Overview
The **Billing Service** handles the financial aspect of the system. It is designed as an Event-Driven microservice that reacts to completed appointments to generate invoices automatically.

## Architecture
- **Type:** Hybrid (Kafka Consumer + HTTP)
- **Port:** 3006
- **Transport:** Apache Kafka

## Key Features
- **Event Consumer:** Listens to the `crear_factura` topic from Kafka.
- **Decoupled Logic:** Generates invoices independently without blocking the appointment process.

## API Documentation
Swagger UI available at: `http://localhost:3006/docs`

## Usage
```bash
npx nest start billing-service --watch