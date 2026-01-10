```markdown
# API Gateway

The API Gateway acts as the single entry point for the Veterinary System, routing client requests to the appropriate backend microservices using a Reverse Proxy pattern.

## Responsibilities
- **Routing:** Forwards requests to Identity and Patient services.
- **Abstraction:** Hides the internal architecture (ports 3001, 3002) from the client.
- **Documentation Aggregation:** Exposes Swagger docs for all services.

## Routing Rules

| Route Prefix      | Target Service    |
|-------------------|-------------------|
| `/api/users`      | Identity Service  |
| `/api/auth`       | Identity Service  |
| `/api/patients`   | Patient Service   |

## Environment Variables

```env
PORT=3000
IDENTITY_SERVICE_URL=http://localhost:3001
PATIENT_SERVICE_URL=http://localhost:3002

Running the Gateway
Bash

# Development mode
pnpm start:dev

The gateway runs on Port 3000.