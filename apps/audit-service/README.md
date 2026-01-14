# 🛡️ Audit Service

## Overview
The **Audit Service** is a specialized security component that ensures system-wide accountability. It operates as a passive observer, consuming events from the **Kafka Message Bus** without interfering with business logic.

## Architecture
- **Type:** Pure Microservice (Kafka Consumer)
- **Pattern:** Event Sourcing / Audit Log
- **GroupId:** `audit-consumer-group`

## Monitored Events
- `crear_factura`: Tracks billing and appointment generation.
- `staff_status_changed`: Monitors veterinary personnel activity and availability changes.
- `inventory_reduced`: Logs every stock deduction for medical supplies.

## Purpose
Provides a central repository of system activity for forensic analysis, operational monitoring, and legal compliance.