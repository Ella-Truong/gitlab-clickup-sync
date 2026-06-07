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

- `docs/architecture.md`
- `notes/system-architecture.md`