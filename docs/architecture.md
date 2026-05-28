# System Architecture

## Overview

GitLab → ClickUp Workflow Sync is an event-driven backend system that automates workflow synchronization between GitLab development activity and ClickUp task workflows.

The system receives GitLab webhook events, processes them asynchronously through RabbitMQ, evaluates workflow rules, and updates ClickUp task statuses automatically.

The architecture focuses on:
- asynchronous processing
- lightweight webhook ingestion
- service decoupling
- distributed workflow automation

---

# High-Level Architecture

```text
GitLab
   ↓ Webhook Events
Webhook Server
   ↓
Event Normalization
   ↓
RabbitMQ Queue
   ↓
Background Worker
   ↓
Workflow Rule Engine
   ↓
ClickUp API
   ↓
Task Status Synchronization
```

---

# Project Structure

```text
project-root/
│
├── apps/
│   ├── webhook-server/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── worker/
│       ├── src/
│       │   ├── consumers/
│       │   ├── services/
│       │   ├── rules/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── worker.ts
│       │
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── shared/
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── infrastructure/
│   └── rabbitmq/
│
├── docs/
│   ├── architecture.md
│   ├── rabbitmq-notes.md
│   └── deployment.md
│
├── docker-compose.yml
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

# Core Services

## Webhook Server

The webhook server is responsible for:
- receiving GitLab webhook payloads
- validating incoming requests
- extracting task identifiers
- normalizing external payloads
- publishing workflow events to RabbitMQ

Example endpoint:

```text
POST /webhook/gitlab
```

The webhook layer intentionally avoids heavy business logic to keep request handling lightweight and responsive.

---

# Event Normalization

GitLab webhook payloads contain large and complex structures.

The system transforms external payloads into simplified internal workflow events.

## Example

### Raw GitLab Payload

```json
{
  "object_kind": "push",
  "ref": "refs/heads/feature/CU-123-auth",
  "commits": []
}
```

### Internal Workflow Event

```json
{
  "taskId": "CU-123",
  "eventType": "PUSH",
  "commitIncrement": 2
}
```

This reduces coupling between downstream services and GitLab-specific schemas.

---

# RabbitMQ

RabbitMQ acts as the asynchronous communication layer between webhook ingestion and workflow processing.

Responsibilities:
- event buffering
- asynchronous processing
- workload distribution
- retry support
- service decoupling

Webhook handlers only queue events and return responses quickly.

Workflow processing happens independently in background workers.

---

# Worker Service

Workers consume normalized workflow events from RabbitMQ.

Responsibilities:
- process workflow events
- evaluate workflow rules
- synchronize ClickUp tasks
- prevent duplicate transitions
- handle background processing

Workers are isolated from webhook ingestion to improve scalability and fault tolerance.

---

# Workflow Rule Engine

The workflow engine maps GitLab development activity to ClickUp task states.

## Example Rules

| GitLab Activity | ClickUp Status |
|---|---|
| Merge Request opened | Review |
| ≥ 3 implementation commits | In Progress |
| Merge Request merged | Done |
| No implementation activity | Backlog |

The rules are intentionally lightweight and predictable.

Project management decisions remain outside automation scope.

---

# Event Flow

```text
Developer pushes commits
        ↓
GitLab webhook triggered
        ↓
Webhook server receives payload
        ↓
Payload normalized into internal event
        ↓
Event published to RabbitMQ
        ↓
Worker consumes event
        ↓
Workflow rules evaluated
        ↓
ClickUp task updated
```

---

# Deployment Architecture

The system is containerized using Docker.

## Deployment Flow

```text
Dockerize Services
        ↓
Deploy to Render
        ↓
Receive Public Backend URL
        ↓
Configure GitLab Webhook
        ↓
Receive GitLab Events Automatically
```

---

# Public Webhook Endpoint

Example:

```text
https://your-service.onrender.com/webhook/gitlab
```

GitLab sends webhook events to this endpoint whenever development activity occurs.

---

# Design Decisions

## Lightweight Webhook Handling

Webhook endpoints should respond quickly.

Heavy synchronization logic is delegated to background workers.

Benefits:
- lower webhook latency
- improved reliability
- better fault isolation

---

## Queue-Based Architecture

RabbitMQ separates:
- event ingestion
- workflow processing

This improves scalability and isolates failures between services.

---

## Internal Event Model

Normalized internal events reduce direct dependency on GitLab payload structures and simplify worker logic.

---

# Future Improvements

Potential future extensions:
- retry queues
- dead-letter queues
- GitHub support
- Slack notifications
- audit logging
- worker metrics
- observability dashboards
- configurable workflow rules

---

# Summary

GitLab → ClickUp Workflow Sync is an event-driven integration platform designed to automate lightweight workflow coordination between development and project management systems.

The architecture emphasizes:
- asynchronous processing
- service decoupling
- lightweight automation
- distributed backend communication
- scalable workflow synchronization