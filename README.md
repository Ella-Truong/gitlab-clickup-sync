# GitLab → ClickUp Workflow Sync

Event-driven workflow automation that synchronizes GitLab activity with ClickUp task statuses using webhooks, RabbitMQ, and background workers.

Built to reduce manual task updates, minimize context switching, and improve engineering workflow visibility during development.

---

# Motivation

During development, engineers frequently switch between:

- GitLab
- ClickUp
- code review
- implementation tasks

A common workflow issue is forgetting to manually update task statuses after development activity such as:

- opening Merge Requests
- pushing implementation commits
- merging completed work

Although these updates are simple, repeated context switching creates workflow friction and inconsistent project visibility.

This project automates workflow state transitions based on real GitLab activity.

---

# Architecture

```text
GitLab
    ↓ Webhook Event
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

# Core Architecture Concepts

## Webhook Ingestion Layer

The Express.js server acts as a lightweight webhook receiver.

Responsibilities:
- receive GitLab webhook events
- validate payloads
- extract ClickUp task IDs
- normalize external payloads into internal event formats
- publish events to RabbitMQ

The webhook layer intentionally avoids heavy business logic to keep webhook processing fast and reliable.

---

## Event Normalization

Raw GitLab payloads are transformed into simplified internal workflow events.

Example:

### Raw GitLab Payload

```json
{
  "object_kind": "push",
  "ref": "refs/heads/feature/CU-123-auth",
  "commits": [ ... ]
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

This keeps workers decoupled from GitLab-specific payload structures.

---

## Asynchronous Processing with RabbitMQ

RabbitMQ is used as an event queue between webhook ingestion and workflow processing.

Benefits:
- asynchronous processing
- event buffering
- reduced webhook response latency
- retry capability
- cleaner separation of concerns
- improved reliability during API failures or traffic spikes

---

## Workflow Worker

Background workers consume normalized events from RabbitMQ and execute workflow automation logic.

Responsibilities:
- commit activity tracking
- workflow rule evaluation
- task state transitions
- ClickUp API synchronization
- duplicate transition prevention

---

# Workflow Rules

| GitLab Activity | ClickUp Status |
|---|---|
| Merge Request opened | Review |
| ≥ 3 implementation commits | In Progress |
| Merge Request merged | Done |
| No implementation activity | Backlog |

The system intentionally keeps workflow rules simple and predictable.

Human decisions such as:
- sprint planning
- reassignment
- prioritization
- blocked tasks

remain the responsibility of project managers and engineering leads.

---

# Commit Threshold Logic

The system uses activity thresholds instead of updating status on every commit.

Example:

```text
Commit #1 → ignore
Commit #2 → ignore
Commit #3 → move task to "In Progress"
```

This reduces noisy transitions and treats sustained implementation activity as meaningful workflow progress.

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

GitLab branches and Merge Requests are linked to ClickUp tasks using shared task IDs.

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

The system extracts the task ID and synchronizes the corresponding ClickUp task automatically.

---

# Tech Stack

- Node.js
- Express.js
- RabbitMQ
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

# Engineering Goals

- reduce manual workflow overhead
- minimize context switching
- improve engineering task visibility
- encourage incremental development workflows
- keep coordination lightweight
- explore event-driven backend architecture
- learn asynchronous system design patterns

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

The goal is not to replace project management tools, but to reduce repetitive coordination work through lightweight workflow automation and event-driven backend design.
