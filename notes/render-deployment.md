# Deploying a TypeScript Monorepo Service to Render with CloudAMQP

## Overview

This document records the deployment process, encountered issues, root-cause analysis, and lessons learned while deploying the `webhook-server` service of the GitLab/GitHub → ClickUp synchronization system.

The goal was to deploy a TypeScript-based webhook service to Render and connect it to a managed RabbitMQ instance hosted on CloudAMQP.

---

## System Architecture

```text
GitLab / GitHub
        │
        ▼
Webhook Server (Render)
        │
        ▼
RabbitMQ (CloudAMQP)
        │
        ▼
Worker Service
        │
        ▼
ClickUp API
```

### Responsibilities

#### Webhook Server

- Receives incoming webhook events from GitLab or GitHub.
- Validates and transforms payloads.
- Publishes messages to RabbitMQ.

#### RabbitMQ

- Acts as a message broker.
- Decouples webhook ingestion from downstream processing.
- Enables asynchronous communication between services.

#### Worker

- Consumes messages from RabbitMQ.
- Processes business logic.
- Creates or updates ClickUp tasks.

---

# CloudAMQP Configuration

## Motivation

During local development, RabbitMQ was hosted through Docker:

```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

This approach works well for development but is not suitable for cloud deployment because:

- Render services cannot access local Docker containers.
- Infrastructure must be publicly accessible.
- A managed solution reduces operational complexity.

CloudAMQP was selected because:

- It provides managed RabbitMQ instances.
- It offers a free tier (Loyal Lemming).
- It requires minimal operational maintenance.
- It integrates easily with cloud-hosted applications.

---

## Environment Variable Configuration

The CloudAMQP instance provides a connection string:

```env
RABBITMQ_URL=amqps://<username>:<password>@<host>/<vhost>
```

This value was stored in Render as an environment variable.

### Common Mistake

An early deployment attempt produced:

```text
Environment variable keys must consist of alphabetic characters, digits, '_', '-', or '.'
```

### Cause

The complete expression:

```text
RABBITMQ_URL=amqps://...
```

was entered into the **Key** field.

### Resolution

Render separates keys and values.

Correct configuration:

| Key | Value |
|------|------|
| RABBITMQ_URL | amqps://... |

---

# Initial Deployment

## Service Configuration

### Root Directory

```text
webhook-server
```

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm start
```

### Environment Variables

```env
RABBITMQ_URL=amqps://...
```

---

# Deployment Failure

## Error Message

The first deployment failed with:

```text
Error: Cannot find module '/opt/render/project/src/webhook-server/dist/server.js'
```

At first glance, this suggested one of three possibilities:

1. TypeScript compilation failed.
2. Build artifacts were not generated.
3. The runtime was looking for files in an incorrect location.

---

# Hypothesis 1: TypeScript Build Failure

The build logs were examined.

Render reported:

```text
Build successful 🎉
```

This indicated that:

```bash
npm run build
```

completed successfully.

Therefore, the issue was unlikely to be a TypeScript compilation error.

---

# Hypothesis 2: Missing Build Artifacts

To verify local behavior:

```bash
npm run build
```

followed by:

```bash
find dist -type f
```

Result:

```text
dist/src/server.js
dist/src/app.js
...
```

The build artifacts existed locally.

The service could also be started successfully:

```bash
node dist/src/server.js
```

Output:

```text
Connected to RabbitMQ
Server running on port 4000
```

This demonstrated that:

- TypeScript compilation worked.
- Runtime code worked.
- RabbitMQ connectivity worked.

The problem was therefore specific to the deployment environment.

---

# Runtime Investigation

At this stage, assumptions were avoided.

Instead of continuing to guess, the runtime filesystem was inspected directly.

The Render Start Command was temporarily replaced with:

```bash
pwd && ls && find . -name server.js
```

This allowed inspection of files available inside the deployed container.

---

## Diagnostic Results

Render produced:

```text
/opt/render/project/src/webhook-server

dist
node_modules
package.json
src

./dist/webhook-server/src/server.js
```

This was the breakthrough observation.

---

# Root Cause Analysis

## Expected Runtime Path

The application attempted to start using:

```bash
node dist/src/server.js
```

This assumes the compiled file exists at:

```text
dist/src/server.js
```

---

## Actual Runtime Path

Render generated:

```text
dist/webhook-server/src/server.js
```

The runtime therefore searched for:

```text
dist/src/server.js
```

while the file actually existed at:

```text
dist/webhook-server/src/server.js
```

The startup process failed because the expected artifact path differed from the generated artifact path.

---

# Why Did This Happen?

The project uses a monorepo structure:

```text
project-root/
├── shared/
├── webhook-server/
├── worker/
└── tsconfig.base.json
```

The webhook service compiles both:

```json
"include": [
  "src/**/*",
  "../shared/src/**/*"
]
```

Because TypeScript compiles files originating from multiple directories, the emitted output structure differs between environments.

Locally, compilation produced:

```text
dist/src/server.js
```

In Render, the emitted structure preserved the package boundary:

```text
dist/webhook-server/src/server.js
```

As a result, the runtime path was no longer valid.

---

# Resolution

The startup command was updated.

Previous configuration:

```bash
node dist/src/server.js
```

Updated configuration:

```bash
node dist/webhook-server/src/server.js
```

After redeployment:

```text
Connected to RabbitMQ
Server running on port 10000
```

The service successfully started.

---

# Deployment Verification

## Root Endpoint

Request:

```http
GET /
```

Response:

```text
Cannot GET /
```

This is expected behavior because no route is defined for `/`.

---

## Health Endpoint

Request:

```http
GET /health
```

Response:

```json
{
  "status": "healthy"
}
```

This confirms:

- The application is running.
- Routing is functioning correctly.
- Render can reach the application.
- The service is publicly accessible.

---

# Key Lessons Learned

## 1. Build Success Does Not Guarantee Runtime Success

A successful build only confirms that code compilation succeeded.

Runtime failures can still occur because of:

- Incorrect file paths.
- Missing environment variables.
- Startup configuration errors.
- Infrastructure issues.

---

## 2. Validate Assumptions Using Diagnostics

Instead of guessing, inspect the environment directly.

Useful commands:

```bash
pwd
ls
find . -name server.js
```

These commands often reveal deployment issues faster than repeated configuration changes.

---

## 3. Understand the Difference Between Build-Time and Runtime

Build-time concerns:

```text
TypeScript
Dependency installation
Compilation
```

Runtime concerns:

```text
Startup commands
Environment variables
Network connectivity
Generated artifacts
```

Many deployment failures occur because these concerns are conflated.

---

## 4. Monorepos Require Careful Output Verification

When sharing code across services:

```text
shared/
webhook-server/
worker/
```

the emitted build structure may differ between environments.

Always verify generated artifacts rather than assuming output locations.

---

# Final Status

## Completed

- CloudAMQP instance created.
- RabbitMQ connectivity verified.
- Render webhook-server deployed successfully.
- Health endpoint verified.
- Public URL reachable.

## Remaining Work

- Deploy worker service.
- Connect worker to CloudAMQP.
- Configure GitLab/GitHub webhooks.
- Integrate ClickUp API.
- Perform end-to-end testing.

---

## Current Architecture

```text
GitLab / GitHub
        │
        ▼
Webhook Server (Render) ✅
        │
        ▼
CloudAMQP ✅
        │
        ▼
Worker (Pending)
        │
        ▼
ClickUp (Pending)
```