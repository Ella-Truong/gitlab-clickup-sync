# End-to-End Testing Guide

## Overview

This document describes the End-to-End (E2E) testing strategy for the GitLab-to-ClickUp synchronization system.

The purpose of E2E testing is to verify that GitLab webhook events are correctly processed through the entire system and result in the expected ClickUp actions.

## Test Directory Structure

```text
project-root/
│
├── webhook-server/
│   └── src/
│
├── worker/
│   └── src/
│
├── tests/
│   ├── e2e/
│   │   ├── gitlab-to-clickup.e2e.test.ts
│   │   ├── issue-hook.e2e.test.ts
│   │   ├── push-hook.e2e.test.ts
│   │   ├── merge-request.e2e.test.ts
│   │   └── fixtures/
│   │       ├── issue-event.json
│   │       ├── push-event.json
│   │       └── merge-request-event.json
│   │
│   └── setup/
│       ├── test-rabbitmq.ts
│       └── mock-clickup.ts
│
└── docs/
    └── e2e-testing-guide.md
```

## System Flow

```text
GitLab
    ↓
Webhook Server
    ↓
RabbitMQ
    ↓
Worker
    ↓
ClickUp Service
    ↓
ClickUp API
```

## Test Scope

The E2E tests validate the following:

- GitLab webhook requests are received successfully
- Events are published to RabbitMQ
- Worker consumes events from RabbitMQ
- Event payloads are mapped correctly
- ClickUp service methods are invoked with correct data
- Unsupported events are handled gracefully
- Errors are logged without crashing the worker

## Test Environment

### Required Services

- Webhook Server
- Worker Service
- RabbitMQ
- Mocked ClickUp Service

### Testing Approach

To avoid creating real ClickUp tasks during automated testing, the ClickUp service will be mocked.

The test will focus on verifying that the correct ClickUp actions are triggered based on incoming GitLab events.

## Test Scenarios

### 1. Issue Hook → Create Task

#### Input

GitLab Issue Hook event indicating an issue assignment.

#### Expected Result

- Event is received by the webhook server
- Event is published to RabbitMQ
- Worker consumes the event
- ClickUp task is created
- Task status is set to **To Do**

---

### 2. Push Hook (First Commit) → Review

#### Input

GitLab Push Hook representing the first commit.

#### Expected Result

- Worker processes the event
- Existing ClickUp task status is updated to **Review**

---

### 3. Push Hook (Third Commit) → In Progress

#### Input

GitLab Push Hook representing the third commit.

#### Expected Result

- Worker processes the event
- Existing ClickUp task status is updated to **In Progress**

---

### 4. Merge Request Opened → Testing

#### Input

GitLab Merge Request Hook with action `open`.

#### Expected Result

- Worker processes the event
- ClickUp task status is updated to **Testing**

---

### 5. Merge Request Merged → Done

#### Input

GitLab Merge Request Hook with action `merge`.

#### Expected Result

- Worker processes the event
- ClickUp task status is updated to **Done**

---

### 6. Unsupported Event Type

#### Input

Unsupported GitLab event type.

#### Expected Result

- Event is consumed successfully
- Warning is logged
- No ClickUp action is executed

---

### 7. ClickUp Service Failure

#### Input

Valid GitLab event while the ClickUp service throws an error.

#### Expected Result

- Error is logged
- Worker remains running
- Application does not crash

## Success Criteria

The E2E test suite is considered successful when:

- All supported GitLab events are processed correctly
- Expected ClickUp operations are triggered
- Unsupported events are ignored safely
- Worker continues operating after failures
- No unhandled exceptions occur

## Future Improvements

- Add Docker-based E2E execution in CI/CD pipeline
- Add ClickUp sandbox integration testing
- Add RabbitMQ retry and dead-letter queue testing
- Add RabbitMQ reconnection testing
- Add performance and load testing

