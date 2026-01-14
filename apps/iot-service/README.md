# IoT Service (Telemetry)

This microservice handles real-time telemetry data from veterinary sensors (IoT devices), such as heart rate monitors and thermometers.

## Features
- **Time Series Data:** Optimized storage for continuous data streams using InfluxDB.
- **High Throughput:** Designed to handle frequent write operations from sensors.
- **Data Retention:** Stores vital signs (Temperature, Heart Rate) linked to a Patient ID.

## Architecture
- **Database:** InfluxDB (Time Series Database).
- **Client:** `@influxdata/influxdb-client` for Node.js.

## Environment Variables

Ensure you have a `.env` file in this directory:

```env
PORT=3004
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=Veterinaria2026!
INFLUXDB_ORG=veterinary
INFLUXDB_BUCKET=telemetry

Running Locally

    Start the database:
    Bash

docker-compose up -d influxdb

Start the service:
Bash

pnpm start:dev
Access Swagger documentation at: http://localhost:3004/docs