# Architecture Notes - GitLab/GitHub → RabbitMQ → ClickUp Integration

## Architecture Overview

This project follows an event-driven, multi-service architecture.

Flow:

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

The system is composed of:

- `webhook-server` (HTTP service)
- `worker` (background processing service)
- `shared` (shared library)

Although all code lives in a single repository, the services have separate responsibilities and can run independently.

---

## What Architecture Is This?

### Multi-Service Repository

The repository contains multiple applications:

- webhook-server
- worker

Each service has its own:

- `package.json`
- `tsconfig.json`
- Dockerfile
- runtime process

This is different from a monolithic application where everything runs inside a single server process.

### Event-Driven Architecture

Services communicate through RabbitMQ messages instead of direct function calls.

```text
webhook-server
      ↓
 publish event
      ↓
   RabbitMQ
      ↓
worker consumes event
```

The worker does not know who produced the message.

The webhook-server does not know who consumes the message.

Both only know the event contract.

### Small Distributed System

Even though this is a relatively small project, it introduces `distributed-system` concepts:

- multiple services
- message queues
- asynchronous communication
- service boundaries
- shared contracts

---

## Why Not Call ClickUp Directly?

A simpler design could be:

```text
GitLab
   ↓
webhook-server
   ↓
ClickUp
```

### Advantages

- simpler implementation
- fewer moving parts
- easier local development

### Disadvantages

- webhook-server waits for ClickUp
- slow ClickUp responses slow down webhook processing
- ClickUp outages directly impact GitLab webhook handling
- harder to scale processing independently

---

## Why Use RabbitMQ?

RabbitMQ acts as a buffer between services.

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

### Decoupling

webhook-server only publishes events.

It does not need to know:

- how ClickUp works
- how tasks are created
- how many workers exist

### Reliability

If ClickUp is temporarily unavailable:

- messages remain in RabbitMQ
- worker can retry later

Without RabbitMQ, failed API calls may result in lost work.

### Scalability

If processing becomes heavy:

```text
1 worker
   ↓
2 workers
   ↓
10 workers
```

can consume from the same queue.

The webhook-server does not need to change.

### Faster Webhook Response

webhook-server can:

1. receive webhook
2. publish message
3. return success

instead of waiting for ClickUp processing to finish.

---

## Why Separate webhook-server and worker?

### Single Responsibility

**webhook-server**

Responsibilities:

- receives events
- validates payloads
- publishes messages

**worker**

Responsibilities:

- consumes messages
- executes business logic
- integrates with ClickUp

Each service has one primary responsibility.

### Independent Scaling

If many GitLab events arrive:

→ scale webhook-server

If ClickUp processing becomes slow:

→ scale worker

Each service can grow independently.

### Easier Maintenance

When debugging:

```text
Webhook issue?
→ investigate webhook-server

Processing issue?
→ investigate worker
```

Responsibilities are clearly separated.

---

## Why Have a Shared Package?

Both services need to agree on event structure.

Example:

```ts
interface GitlabIssueEvent {
  title: string;
  description: string;
}
```

Without shared types:

```text
webhook-server
 └─ GitlabIssueEvent

worker
 └─ GitlabIssueEvent
```

The definitions can drift apart.

With shared:

```text
shared/src/types
        ↓
webhook-server imports
        ↓
worker imports
```

Single source of truth.

---

## Why Multiple package.json Files?

Each service is its own application.

**webhook-server** needs:

- Express
- HTTP-related dependencies

**worker** needs:

- RabbitMQ consumer logic
- ClickUp integration

Not every service requires the same dependencies.

Separate `package.json` files keep each service focused.

---

## Why tsconfig.base.json Exists?

Many TypeScript settings are shared:

- strict
- target
- module
- esModuleInterop

Instead of duplicating them in every project:

```text
shared
worker
webhook-server
      ↑
      |
tsconfig.base.json
```

All projects inherit common settings from the base configuration.

### Benefits

- consistency
- less duplication
- easier maintenance

### Trade-off

Changes in the base configuration affect every project that extends it.

---

## Trade-offs of This Architecture

### Advantages

- Clear separation of responsibilities
- Event-driven communication
- Better scalability
- Better fault isolation
- Easier to extend
- Real-world architecture patterns

### Disadvantages

- More configuration
- More moving parts
- RabbitMQ adds operational complexity
- Harder debugging across service boundaries
- More testing complexity
- Requires understanding asynchronous workflows

---

## Future Improvements

Possible next steps:

- Convert to a monorepo with workspaces
- Package shared as a reusable library
- Add CI/CD pipelines
- Add monitoring and logging
- Add retry and dead-letter queues
- Deploy services independently

---

## Key Lesson

This architecture introduces an important backend principle:

**Separate receiving work from processing work.**

Instead of:

```text
Request → Process Everything
```

Use:

```text
Request → Queue → Process
```

This improves scalability, reliability, and maintainability at the cost of additional complexity.