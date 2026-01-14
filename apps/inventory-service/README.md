# 💊 Inventory Service (Enhanced)

## Overview
The Inventory Service manages the lifecycle of veterinary medical supplies. It ensures stock levels are maintained and provides real-time alerts for low-supply items.

## API Operations
- **GET `/inventory`**: Fetch complete catalog and current stock levels.
- **POST `/inventory`**: Register new medical supplies.
- **PATCH `/inventory/:id/reduce`**: Decrease stock upon usage.

## Event-Driven Logic
- **Stock Tracking**: Automatically reduces inventory when a prescription is issued by the Medical Service via Kafka.
- **Low Stock Alerts**: Triggers a system warning when an item's quantity drops below 10 units.

## Usage
```bash
npx nest start inventory-service --watch