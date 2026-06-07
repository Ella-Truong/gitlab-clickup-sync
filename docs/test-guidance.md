# End-to-End Testing Guide

## Overview

This document describes the End-to-End (E2E) testing strategy for the GitLab-to-ClickUp synchronization system.

The purpose of E2E testing is to verify that GitLab webhook events are correctly processed through the entire system and result in the expected ClickUp actions.

---
## Test Directory Structure

```text
worker/
├── src/
│   ├── consumers/
│   ├── handler/
│   └── services/
│
├── tests/
│   ├── e2e/
│   │   ├── consumer.e2e.test.ts
│   │   └── fixtures/
│   │       └── issue-event.json
│   │
│   └── setup/
│       ├── test-rabbitmq.ts
│       └── mock-clickup.ts
│
└── jest.config.ts
```

### Structure Overview

- `tests/e2e/` contains end-to-end test cases covering the complete GitLab → RabbitMQ → Worker → ClickUp workflow.
- `tests/e2e/fixtures/` contains sample GitLab webhook payloads used during testing.
   - establish a single source of truth for testing data
   - prevent duplication of event payloads across test files
   - improve test readability and maintainability
   - makes it easier to add new test scenarios in the future
   - allow tests to focus on behaviors rather than payload construction
- `tests/setup/` contains shared test utilities, mocks, and environment setup.
- `docs/e2e-testing-guide.md` documents the E2E testing strategy and scenarios.

---
## E2E Test Scope

```text
Test
 ↓
RabbitMQ
 ↓
Worker Consumer
 ↓
Event Handler
 ↓
ClickUp Service (Mocked)
```

The E2E tests validate the following:

- Messages are published successfully to RabbitMQ
- Worker consumers receive messages correctly
- Event handlers process payloads correctly
- ClickUp service methods are invoked as expected
- The worker remains stable during processing

---

## Test Environment

### Required Services

- Worker Service
- RabbitMQ
- Mocked ClickUp Service

### RabbitMQ

RabbitMQ must be running before executing E2E tests

```bash
docker compose up -d rabbitmq
```
---

## Testing Approach

* To avoid creating real ClickUp tasks during automated testing, the ClickUp service will be mocked
* The tests use a real RabbitMQ instance and a real consumer while replacing ClickUp API calls with Jest mocks
* The test will focus on verifying that the correct ClickUp actions are triggered based on incoming GitLab events

---

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

