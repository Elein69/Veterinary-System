
# Identity Service

This microservice handles user authentication, authorization, and identity management using Role-Based Access Control (RBAC).

## Features
- **User Management:** Create, Read, Update, and Delete (CRUD) users.
- **Role Management:** Support for `Admin`, `Veterinarian`, and `User` roles.
- **Security:** Password hashing using `bcrypt`.
- **Database:** PostgreSQL (Entities: `User`).

## Environment Variables

Ensure you have a `.env` file in this directory:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Veterinaria2026!
DB_NAME=postgres
JWT_SECRET=YourSecretKey

Running the Service
Bash

# Development mode
pnpm start:dev

The service will run on Port 3001. Access Swagger documentation at: http://localhost:3001/docs