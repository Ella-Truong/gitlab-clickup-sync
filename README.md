# GitLab → ClickUp Workflow Sync

Event-driven workflow automation system that synchronizes GitLab development activity with ClickUp task workflows using webhooks, RabbitMQ, background workers, and asynchronous processing.

Built to reduce manual task updates, minimize context switching, and improve engineering workflow visibility during development.

---

# Overview

Engineering teams often work across multiple platforms:

- GitLab/GitHub
- ClickUp
- code reviews
- implementation branches
- merge requests

A common workflow issue is that developers forget to manually update the task's status after doing activities such as:

- opening Merge Requests
- pushing implementation commits
- merging completed work

Although these updates are simple, repeatedly switching contexts between development and project management tools creates unnecessary workflow friction and inconsistent task visibility.

This project automates workflow state transitions based on real GitLab activity.

---

# Architecture

```text
GitLab
   ↓ Webhook Events
Express Webhook Server
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

# Core System Design

## Webhook Ingestion Layer

The Express.js server acts as a lightweight webhook receiver.

Responsibilities:

- receive GitLab webhook events
- validate incoming payloads
- extract ClickUp task identifiers
- normalize external payloads into internal workflow events
- publish events to RabbitMQ

The webhook layer intentionally avoids heavy business logic to keep webhook processing fast and reliable.

---

## Event Normalization

Raw GitLab payloads are transformed into simplified internal workflow events.

### Example

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
  "commitCount": 2
}
```

This keeps downstream workers decoupled from GitLab-specific payload structures.

---

## Asynchronous Processing with RabbitMQ

RabbitMQ acts as the event queue between webhook ingestion and workflow processing.

Benefits:

- asynchronous processing
- event buffering
- reduced webhook response latency
- retry capability
- improved reliability during API failures
- cleaner separation of concerns
- scalable background processing

The webhook server only receives and queues events, while workers process synchronization independently.

---

## Background Worker

Workers consume normalized events from RabbitMQ and execute workflow automation logic.

Responsibilities:

- commit activity tracking
- workflow rule evaluation
- task state transitions
- ClickUp API synchronization
- duplicate transition prevention

---

# Workflow Rules


| GitLab Event | Condition | ClickUp Action | ClickUp Status |
|--------------|-----------|---------------|---------------|
| Issue Assigned | User is assigned to an issue | Create ClickUp task | To Do |
| Push Event | First commit detected | Update existing task | Review |
| Push Event | Total commits reach 3 | Update existing task | In Progress |
| Merge Request Opened | MR created | Update existing task | Testing |
| Merge Request Merged | MR merged successfully | Update existing task | Done |


The workflow rules are intentionally simple and predictable.

Human decisions such as:
- sprint planning
- prioritization
- reassignment
- blocked tasks

Remain under project management control.

---

# Commit Threshold Logic

The system avoids updating workflow status on every commit.

### Example

```text
Commit #1 → review
Commit #2 → ignore
Commit #3 → move task to "In Progress"
```

This reduces noisy workflow transitions and treats sustained implementation activity as meaningful development progress.

Duplicate status updates are automatically ignored.

---

# Example Workflow

```text
Developer pushes commits
        ↓
GitLab webhook triggered
        ↓
Express server receives payload
        ↓
Task ID extracted and normalized
        ↓
Workflow event published to RabbitMQ
        ↓
Worker processes event
        ↓
Workflow rules evaluated
        ↓
ClickUp task updated
```

---

# Task Linking Convention

GitLab branches and Merge Requests are linked to ClickUp tasks using shared task identifiers

### ClickUp Task

```text
CU-123 Implement authentication flow
```

### Git Branch

```text
feature/CU-123-auth-flow
```

### Merge Request

```text
[CU-123] Implement authentication flow
```
### Commits

```text
feat(CU-123): implement authentication flow
fix(CU-123): handle invalid JWT tokens
refactor(CU-123): simplify auth service
test(CU-123): add login endpoint tests
docs(CU-123): update authentication setup guide
```

The system extracts task identifiers automatically and synchronizes the corresponding ClickUp workflow state.

---

# Tech Stack

- TypeScript
- Node.js
- Express.js
- RabbitMQ
- Docker
- GitLab Webhooks
- ClickUp API

---

# Core Features

- GitLab webhook ingestion
- RabbitMQ event queue
- asynchronous workflow processing
- ClickUp task synchronization
- commit activity tracking
- workflow rule engine
- task ID extraction
- duplicate transition prevention
- normalized internal workflow events

---

# Deployment Flow

The system is designed to run as a containerized backend service.

### Deployment Steps

```text
Dockerize services
        ↓
Deploy backend + worker
        ↓
Receive public backend URL
        ↓
Configure GitLab webhook
        ↓
Receive GitLab events automatically
        ↓
Process workflow synchronization asynchronously
```

### Example Webhook Endpoint

```text
https://your-service.com/webhook/gitlab
```

GitLab sends webhook events to the deployed backend automatically whenever development activity occurs.

---

# Engineering Goals

- reduce manual workflow overhead
- minimize context switching
- improve engineering task visibility
- encourage incremental development workflows
- explore event-driven backend architecture
- learn asynchronous system design patterns
- practice distributed service communication

---

# Future Improvements

Potential future enhancements:

- configurable workflow rules
- GitHub support
- Slack notifications
- stale task detection
- retry queues
- dead-letter queues
- deployment event synchronization
- worker observability and metrics
- audit logging

---

# Why This Project Exists

This project was inspired by a real engineering internship workflow where developers frequently forgot to manually update ClickUp task statuses after GitLab activity.

The goal is not to replace project management tools, but to reduce repetitive coordination work through lightweight workflow automation and event-driven backend architecture.
