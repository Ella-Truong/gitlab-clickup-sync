# System Architecture

## Overview

GitLab → ClickUp Workflow Sync is a lightweight event-driven backend project that automates task workflow updates based on GitLab development activity.

The system receives GitLab webhook events, sends them through RabbitMQ for asynchronous processing, and updates ClickUp task statuses automatically.

The project is intentionally small and focused on learning:
- RabbitMQ
- Docker
- asynchronous processing
- webhook systems
- multi-service communication
- deployment on Render

---

# High-Level Architecture

```text
GitLab
   ↓ Webhook Events
Webhook Server
   ↓
RabbitMQ
   ↓
Worker Service
   ↓
ClickUp API
```

---

# Project Structure

```text
project-root/
│
├── webhook-server/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── worker/
│   ├── src/
│   │   ├── consumers/
│   │   ├── services/
│   │   ├── worker.ts
│   │   └── app.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

# Core Services

## Webhook Server

The webhook server is responsible for:
- receiving GitLab webhook events
- validating incoming requests
- extracting task identifiers
- publishing events to RabbitMQ

Example endpoint:

```text
POST /webhook/gitlab
```

The webhook server stays lightweight and avoids heavy business logic.

Its main responsibility is forwarding events to RabbitMQ quickly.

---

# RabbitMQ

RabbitMQ acts as the communication layer between services.

Responsibilities:
- asynchronous event processing
- message buffering
- service decoupling
- background job handling

Instead of processing everything immediately inside the webhook request, events are pushed into a queue and handled later by workers.

This improves:
- responsiveness
- reliability
- scalability

---

# Worker Service

The worker service consumes events from RabbitMQ.

Responsibilities:
- process incoming events
- evaluate workflow logic
- update ClickUp tasks
- handle background processing

The worker runs independently from the webhook server.

This separation makes the system easier to scale and maintain.

---

# Example Event Flow

```text
Developer pushes commits
        ↓
GitLab webhook triggered
        ↓
Webhook server receives event
        ↓
Event published to RabbitMQ
        ↓
Worker consumes event
        ↓
ClickUp task updated
```

---

# Example Workflow Rules
## GitLab → ClickUp Workflow

| GitLab Event | Condition | ClickUp Action | ClickUp Status |
|--------------|-----------|---------------|---------------|
| Issue Assigned | User is assigned to an issue | Create ClickUp task | To Do |
| Push Event | First commit detected | Update existing task | Review |
| Push Event | Total commits reach 3 | Update existing task | In Progress |
| Merge Request Opened | MR created | Update existing task | Testing |
| Merge Request Merged | MR merged successfully | Update existing task | Done |

---

# Docker Architecture

Each service runs inside its own Docker container.

Services:
- webhook-server
- worker
- rabbitmq

Docker Compose is used for local development and service orchestration.

Example:

```text
Docker Compose
    ├── webhook-server
    ├── worker
    └── rabbitmq
```

This setup helps simulate a real distributed backend environment locally.

---

# Deployment

The system is deployed on Render using Docker containers.

Deployment flow:

```text
Dockerize Services
        ↓
Deploy to Render
        ↓
Configure GitLab Webhook
        ↓
Receive Events Automatically
```

Example public webhook endpoint:

```text
https://your-service.onrender.com/webhook/gitlab
```

---

# Design Decisions

## Lightweight Webhook Handling

Webhook endpoints should respond quickly.

Heavy processing is delegated to background workers through RabbitMQ.

Benefits:
- faster response times
- improved reliability
- better fault isolation

---

## Queue-Based Architecture

RabbitMQ separates:
- event ingestion
- background processing

This allows services to operate independently.

---

## Simple Service Separation

The project uses only two backend services:
- webhook-server
- worker

The architecture remains intentionally small to keep the system easy to understand and deploy.

---

# Future Improvements

Possible future extensions:
- retry queues
- dead-letter queues
- GitHub integration
- Slack notifications
- logging and monitoring
- additional workflow rules

---

# Summary

GitLab → ClickUp Workflow Sync is a lightweight event-driven backend project built to explore:
- RabbitMQ
- Docker
- asynchronous systems
- webhook architecture
- distributed service communication
- cloud deployment

The project focuses on simplicity, practical backend concepts, and real-world event-driven workflows.