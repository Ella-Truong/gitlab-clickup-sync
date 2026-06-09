# GitLab → ClickUp Workflow Sync

Event-driven workflow automation system that synchronizes GitLab development activity with ClickUp task workflows using webhooks, RabbitMQ, background workers, and asynchronous processing.

Built to reduce manual task updates, minimize context switching, and improve engineering workflow visibility during development.

---

## Overview

Engineering teams often work across multiple platforms:

- GitLab/GitHub
- ClickUp
- code reviews
- implementation branches
- merge requests

A common workflow issue is that developers forget to manually update task status after activities such as:

- opening Merge Requests
- pushing implementation commits
- merging completed work


---
## Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Messaging**: RabbitMQ, amqplib
- **Testing**: Jest, Integration Testing, E2E Testing
- **Infrastructure**: Docker, Docker Compose, Render
- **Integrations**: GitLab/GitHub Webhooks, ClickUp API

---
## Quick Start

### Prerequisites

- Node.js
- Docker
- GitLab account
- ClickUp account

### Install Dependencies

```bash
cd webhook-server
npm install

cd ../worker
npm install
```
### Start RabbitMQ

```bash
docker compose up -d rabbitmq
```

RabbitMQ UI:

```text
http://localhost:15672
```
### Start Services

Webhook Server:

```bash
cd webhook-server
npm run dev
```

Worker:

```bash
cd worker
npm run dev
```
### Run Tests

```bash
cd worker
npm test
```
---
## Documentation & Notes

This repository includes both project documentation and engineering notes created during development.

### Documentation

| Document | Description |
|-----------|------------|
| `docs/architecture.md` | Project architecture overview and system workflow |
| `docs/test-guidance.md` | Testing guidelines and project-specific testing recommendations |

### Engineering Notes

| Note | Description |
|--------|------------|
| `notes/system-architecture.md` | Multi-service architecture, design decisions, and trade-offs |
| `notes/rabbitmq.md` | RabbitMQ concepts, producers, consumers, acknowledgements, and queue design |
| `notes/e2e-testing.md` | End-to-end testing strategy, RabbitMQ consumer testing, and lessons learned |

---

## Repository Structure

```text
project-root/
│
├── docs/
│   ├── architecture.md
│   └── test-guidance.md
│
├── notes/
│   ├── system-architecture.md
│   ├── rabbitmq.md
│   └── e2e-testing.md
│
├── shared/
│   ├── src/
│   │   └── types/
│   └── tsconfig.json
│
├── webhook-server/
│   ├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── tsconfig.json
│
├── worker/
│   ├── src/
│   ├── tests/
│   ├── jest.config.js  
|   ├── jest.setup.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── tsconfig.base.json
└── README.md
```

### Architecture Style

This project follows an **event-driven multi-service architecture**.

```text
GitLab
   ↓
webhook-server
   ↓
RabbitMQ
   ↓
worker
   ↓
ClickUp
```

The repository contains:

- **webhook-server** — webhook ingestion service
- **worker** — asynchronous event processing service
- **shared** — shared TypeScript contracts and event definitions

This design separates event ingestion from workflow processing, improving:

- scalability
- fault isolation
- maintainability
- testability

For more details, see:

- [ARCHITECTURE](docs/architecture.md)
- [TEST GUIDANCE](docs/test-guidance.md)
- [System Architecture Notes](notes/system-architecture.md)
- [RabbitMQ Notes](notes/rabbitmq.md)
- [E2E Testing Notes](notes/e2e-testing.md)
- [Deployment](notes/render-deployment.md)
