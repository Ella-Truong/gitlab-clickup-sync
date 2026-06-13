# Redis Flow in GitHub → ClickUp Workflow Sync

## Overview

Redis is used as a lightweight state store to track development activity between incoming GitHub events and ClickUp workflow updates.

The project follows an event-driven architecture:

```text
GitHub Webhook
      │
      ▼
Webhook Server
      │
      ▼
RabbitMQ Queue
      │
      ▼
Worker
      │
      ├── Redis
      │
      └── ClickUp API
```

### Responsibilities

| Component | Responsibility |
|------------|---------------|
| Webhook Server | Receives GitHub webhook events |
| RabbitMQ | Asynchronous message transport |
| Worker | Processes events and applies business rules |
| Redis | Stores temporary workflow state (commit counters) |
| ClickUp | Task management platform |

---

# Why Redis?

RabbitMQ transports messages but does not maintain application state.

For commit-based workflow automation, the worker needs to remember how many commits have been made for a task over time.

Example:

```text
Task #123

Commit 1
Commit 2
Commit 3
Commit 4
```

Without Redis:

- Worker processes one message at a time
- Previous commit information is lost after processing
- No reliable way to know total commit count

With Redis:

```text
task:123:commitCount = 4
```

The worker can retrieve the current count at any time and make workflow decisions.

---

# Redis Data Model

Current implementation uses a simple counter per task.

## Key Structure

```text
task:{taskId}:commitCount
```

Example:

```text
task:123:commitCount
```

Value:

```text
5
```

---

# Event Processing Flow

## Step 1: GitHub Sends Webhook

Example push event:

```json
{
  "taskId": "123",
  "commitId": "abc123"
}
```

---

## Step 2: Webhook Server Receives Event

The webhook server validates the payload and publishes a message to RabbitMQ.

Message:

```json
{
  "eventType": "commit",
  "taskId": "123"
}
```

---

## Step 3: Worker Consumes Message

Worker receives the message from RabbitMQ.

```text
RabbitMQ
    ↓
 Worker
```

---

## Step 4: Worker Updates Redis

Increment commit counter:

```ts
await redis.incr(`task:${taskId}:commitCount`);
```

Redis state:

```text
Before:
task:123:commitCount = 2

After:
task:123:commitCount = 3
```

---

## Step 5: Worker Reads Current Count

```ts
const count = await redis.get(
  `task:${taskId}:commitCount`
);
```

Result:

```text
3
```

---

## Step 6: Apply Business Rules

Example workflow:

```text
0 commits
  ↓
To Do

1 commits
  ↓
In Review

3 commits
  ↓
In Progress
```

---

# Complete Sequence Diagram

```text
GitHub
   │
   │ Push Event
   ▼
Webhook Server
   │
   │ Publish Message
   ▼
RabbitMQ
   │
   │ Consume
   ▼
Worker
   │
   │ INCR task:123:commitCount
   ▼
Redis
   │
   │ Return Current Count
   ▼
Worker
   │
   │ Apply Business Rules
   ▼
ClickUp API
```

---

# Example Redis State

After several commits:

```text
task:101:commitCount = 5
task:102:commitCount = 2
task:103:commitCount = 8
```

Each task maintains its own independent counter.

---

# Benefits of Redis

## Fast

Redis operations are in-memory and extremely fast.

```ts
await redis.incr(key);
await redis.get(key);
```

Both operations typically complete in milliseconds.

---

## Simple

No database schema is required.

```text
task:123:commitCount
```

can be created automatically on first use.

---

## Persistent Across Worker Restarts

Without Redis:

```text
Worker Restart
      ↓
Memory Lost
      ↓
Commit Counts Reset
```

With Redis:

```text
Worker Restart
      ↓
Redis Still Running
      ↓
Commit Counts Preserved
```

---

## Decouples Business Logic

RabbitMQ focuses on message delivery.

Redis focuses on state management.

Worker focuses on workflow decisions.

This separation keeps the architecture clean and maintainable.

---

# Alternatives Considered

## In-Memory Object

```ts
const commitCounts = {};
```

### Pros

- Very simple

### Cons

- Data lost on restart
- Does not work across multiple worker instances

Not suitable for production.

---

## PostgreSQL

Example:

```sql
task_metrics
-------------
task_id
commit_count
updated_at
```

### Pros

- Durable storage
- Reporting and analytics
- Historical tracking

### Cons

- More complexity
- Slower than Redis for counters

Good for long-term reporting systems.

---

## ClickUp Custom Fields

Store commit count directly on the task.

### Pros

- Single source of truth

### Cons

- Additional API calls
- Slower
- Subject to rate limits
- Increased external dependency

Not ideal for real-time event processing.

---

# Why Redis Was Chosen

Redis is a good fit because the project requires:

- Fast counter updates
- Temporary workflow state
- Low operational complexity
- Support for future scaling
- Decoupling from ClickUp API performance

Redis allows the worker to make workflow decisions efficiently while keeping the architecture event-driven and scalable.

---

# Summary

Redis acts as the project's workflow state store.

It tracks commit activity for each task, enabling the worker to:

1. Receive GitHub events from RabbitMQ
2. Increment commit counters in Redis
3. Evaluate workflow rules
4. Update ClickUp task statuses automatically

This design keeps message transport, state management, and workflow automation separated into clearly defined responsibilities.