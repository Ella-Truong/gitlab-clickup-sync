# Dashboard Architecture & Infrastructure Notes

## Vision

GitLab/GitHub ↔ ClickUp Sync is more than a webhook integration. It is an event-driven workflow automation platform that separates configuration, message transport, business logic, and external integrations.

The goal is to deeply understand how services cooperate and how infrastructure supports a platform.

---

# Current Architecture

```text
GitHub / GitLab
        ↓
Webhook Server
        ↓
RabbitMQ
        ↓
Worker
        ↓
Redis
        ↓
ClickUp
```

## Responsibilities

| Component | Responsibility |
|------------|---------------|
| Webhook Server | Receive external events |
| RabbitMQ | Transport messages asynchronously |
| Worker | Process events and apply business rules |
| Redis | Store temporary state |
| ClickUp | External task management |

---

# Next Phase: Dashboard

Add a Dashboard as the control plane of the system.

```text
                 Dashboard
                      ↓
                 PostgreSQL
                      ↓
GitHub / GitLab → Webhook Server
                      ↓
                   RabbitMQ
                      ↓
                    Worker
                      ↓
                    Redis
                      ↓
                   ClickUp
```

Users interact only with the Dashboard.

Infrastructure remains hidden.

---

# Component Responsibilities

## Dashboard

**Control Plane**

Responsibilities:

- Configure repositories
- Connect ClickUp
- View event history
- Monitor system health

Examples:

- Repository settings
- ClickUp token
- Event history
- Health status

---

## PostgreSQL

**Persistent State**

Stores:

### users

```sql
id
email
created_at
```

### repositories

```sql
id
name
webhook_secret
created_at
```

### integrations

```sql
repository_id
clickup_token
clickup_list_id
```

### events

```sql
event_type
status
created_at
```

Database stores platform state, not just business data.

---

## Webhook Server

**Ingress Layer**

Responsibilities:

- Receive GitHub/GitLab events
- Validate payloads
- Publish messages to RabbitMQ

---

## RabbitMQ

**Transport Layer**

Responsibilities:

- Decouple services
- Buffer events
- Enable asynchronous processing

Future improvements:

- Dead Letter Queue
- Retry policies
- Multiple consumers

---

## Worker

**Business Logic Layer**

Responsibilities:

- Consume messages
- Execute workflow rules
- Update ClickUp

Future:

- AI Worker
- Notification Worker

---

## Redis

**Temporary State and Cache**

Current usage:

```text
github:issue:123:commits → 4
```

Future:

- Rate limiting
- Distributed locks
- Caching

---

## ClickUp

**External Dependency**

Responsible for task creation and status updates.

---

# Deployment

### Dashboard

- Vercel

### Webhook Server

- Render

### Worker

- Render

### RabbitMQ

- CloudAMQP

### Redis

- Upstash

### Database

- Supabase PostgreSQL

Users only interact with:

```text
https://your-domain.com
```

Infrastructure remains invisible.

---

# Long-Term Architecture

```text
                 Dashboard
                      ↓
                 PostgreSQL
                      ↓
                 Webhook Server
                      ↓
                   RabbitMQ
                ┌──────┴───────┐
                ↓              ↓
             Worker         AI Worker
                ↓              ↓
             Redis          OpenAI
                ↓
             ClickUp
```

---

# Project Summary

GitLab/GitHub ↔ ClickUp Sync is a small event-driven platform that demonstrates:

- Webhooks
- RabbitMQ
- Workers
- Redis
- PostgreSQL
- Dashboard
- External APIs
- Testing
- Deployment

The goal is not merely syncing two applications, but understanding how modern backend systems are designed and how infrastructure supports a platform.