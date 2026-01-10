# Patient Service

This microservice is responsible for managing veterinary patients (pets) and their association with owners.

## Features
- **Patient Records:** Manage pet details (Name, Breed, Species, Age).
- **Ownership:** Link patients to specific users (via `ownerId`).
- **Validation:** Strict DTO validation for data integrity.
- **Database:** PostgreSQL (Entities: `Patient`).

## Environment Variables

Ensure you have a `.env` file in this directory:

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Veterinaria2026!
DB_NAME=postgres

Running the Service
Bash

# Development mode
pnpm start:dev

The service will run on Port 3002. Access Swagger documentation at: http://localhost:3002/docs