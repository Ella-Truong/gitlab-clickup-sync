# RabbitMQ Notes

## What is RabbitMQ?

### Its role in this project

RabbitMQ is a tool that helps different services communicate with each other asynchronously.

Simple idea:

Instead of one service doing everything immediately, it can send a message to RabbitMQ and let another service handle the work later

### Understanding Buffer and RabbitMQ

* RabbitMQ is a language-agnostic, cannot understanding a Node.js object like: 

```bash
{
  eventType: "merge-request"
}
```
* RabbitMQ transmits messages as raw binary data (bytes), not JavaScript objects. Since this project runs in a Node.js environment, messages are converted into `Buffer` objects before being sent to RabbitMQ.
* `Buffer` is a built-in Node.js object that represents raw binary data (bytes) in memory.
* When publishing a message, a JavaScript object is typically converted using `JSON.stringify()` and then wrapped with `Buffer.from()` before being sent to RabbitMQ.
* When consuming a message, the received `Buffer` is converted back to a string using `toString()`, and then parsed into a JavaScript object using `JSON.parse()`.


---

# Simple Analogy

Think of RabbitMQ like a delivery center.

- Producer = person sending package
- RabbitMQ = delivery center storing packages
- Consumer = worker receiving package

Flow:

Producer → RabbitMQ → Consumer

RabbitMQ keeps messages safe until a worker is ready.

---

# Why RabbitMQ Is Useful

Sometimes tasks:
- take time
- may fail
- depend on external APIs

Doing everything immediately can:
- slow down the server
- cause timeouts
- make the system fragile

RabbitMQ helps move heavy work into the background.

---

# RabbitMQ in This Project

This project syncs GitLab events with ClickUp.

Example:
- issue updated
- merge request created
- task status changed

When GitLab sends a webhook event, backend receives it.

Instead of processing sync immediately:

```text
GitLab → Backend → ClickUp
```

the system can do:

```text
GitLab → Backend → RabbitMQ → Worker → ClickUp
```

---

# How It Works

## Step 1 — GitLab Sends Event

Example:

```text
Issue updated
```

GitLab sends webhook to backend.

---

## Step 2 — Backend Sends Message to RabbitMQ

Backend creates a message like:

```json
{
  "event": "issue_updated",
  "issueId": 42
}
```

RabbitMQ stores this message in a queue.

---

## Step 3 — Worker Reads Message

Another service (worker) reads the message later.

Example:

```text
Sync GitLab issue to ClickUp
```

---

# Main Benefits

## 1. Faster Backend Response

Backend does not wait for:
- ClickUp API
- retries
- database operations

It only queues the message and responds quickly.

---

## 2. Better Reliability

If ClickUp API fails:
- message stays in queue
- worker can retry later

Without RabbitMQ, event could be lost.

---

## 3. Cleaner Architecture

Webhook service and sync service are separated.

RabbitMQ acts like a bridge between them.

---

## 4. Scalability

If many events arrive:

```text
Queue
 ↓ ↓ ↓
Worker 1
Worker 2
Worker 3
```

multiple workers can process messages together.

---

# Important Understanding

RabbitMQ is NOT:
- business logic
- database
- backend framework

RabbitMQ is communication infrastructure.

Its job is:
- move messages
- store messages temporarily
- allow async processing
- improve reliability between services

---

# Key Takeaway

RabbitMQ helps systems process work in the background safely and asynchronously.

Very useful for:
- webhooks
- integrations
- event-driven systems
- microservices