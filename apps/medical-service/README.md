# Medical Service

This microservice manages veterinary medical records (history, diagnosis, treatments) using a NoSQL approach for high flexibility and performance.

## Features
- **Medical History:** Stores unstructured data for treatments and diagnosis.
- **NoSQL Database:** Utilizes DynamoDB for high write throughput.
- **Search:** Supports querying records by Patient ID using Global Secondary Indexes (GSI).

## Architecture
- **Framework:** NestJS
- **Database:** DynamoDB (running locally via Docker for development).
- **ORM:** Dynamoose.

## Environment Variables

Ensure you have a `.env` file in this directory:

```env
PORT=3003
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

Running Locally

    Start the Database: Ensure Docker is running and execute in the root folder:
    Bash

docker-compose up -d dynamodb-local
Start the Service:
Bash

# Inside apps/medical-service
pnpm start:dev