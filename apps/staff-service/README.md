# 👨‍⚕️ Staff Service

## Overview
The **Staff Service** manages the medical personnel of the veterinary clinic. It handles professional profiles, specialties, and real-time availability. It is a critical component for the appointment scheduling workflow.

## Architecture
- **Type:** Hybrid Microservice (REST + RabbitMQ + Kafka)
- **Port:** 3009
- **Communication Patterns:**
  - **REST API:** For administrative management of the staff.
  - **RabbitMQ (RPC):** Responds to availability checks from the Appointment Service.
  - **Kafka (Producer):** Emits events when a staff member's status changes.

## Key Features
- **Specialty Management:** Categorizes staff (Surgery, Cardiology, etc.).
- **Availability Toggle:** Real-time updates of vet status.
- **Inter-service Sync:** Connects with the Audit Service to track personnel activity.

## API Endpoints
- `GET /staff`: Retrieve all personnel.
- `POST /staff`: Register new medical staff.
- `PATCH /staff/:id/toggle`: Switch availability status.

## Usage
```bash
npx nest start staff-service --watch