# 📅 Appointment Service

## Overview
The **Appointment Service** acts as the central orchestrator for scheduling. It demonstrates advanced distributed patterns by combining Synchronous and Asynchronous communication.

## Architecture
- **Type:** REST Microservice (Orchestrator)
- **Port:** 3005
- **Patterns Implemented:**
  - **Synchronous (RPC):** Calls Identity Service via **RabbitMQ** to validate users before booking.
  - **Asynchronous (Event-Driven):** Publishes events to **Apache Kafka** to trigger Billing and Notifications.

## Workflow
1. Receives Booking Request (HTTP).
2. Validates User -> Identity Service (RabbitMQ).
3. Creates Appointment.
4. Emits `crear_factura` Event -> Kafka Broker.

## API Documentation
Swagger UI available at: `http://localhost:3005/docs`

## Usage
```bash
npx nest start appointment-service --watch