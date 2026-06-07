# E2E Testing Notes

## What is E2E Testing?

End-to-End (E2E) testing verifies that multiple components work together correctly through a complete workflow.

Unlike unit tests, E2E tests validate the behavior of the system as a whole.

Example:

```text
RabbitMQ
 ↓
Consumer
 ↓
Handler
 ↓
Service
 ↓
External Integration
```

---

## Testing Pyramid

```text
       E2E
      /   \
 Integration
 /           \
Unit Tests
```

### Unit Tests

- Test a single function
- Fast
- Mock dependencies

### Integration Tests

- Test interactions between components
- May use databases or message brokers

### E2E Tests

- Test complete workflows
- Closest to production behavior
- Slowest and most expensive to run

---

## Why E2E Tests Matter

E2E tests verify that:

- Components can communicate correctly
- Configuration is correct
- Message flows work as expected
- Real integrations behave correctly

They help catch issues that unit tests cannot detect.

---

## E2E Testing in This Project

Current flow:

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

Verified behaviors:

- RabbitMQ message publishing
- RabbitMQ message consumption
- Event processing
- ClickUp service invocation

---

## Mocking External Services

External APIs should be mocked during E2E tests when:

- API calls cost money
- API calls create real data
- Tests need deterministic results

Example:

```text
RabbitMQ      -> Real
Worker        -> Real
ClickUp API   -> Mocked
```

---

## Test Fixtures

Fixtures are reusable test data stored separately from test logic.

Benefits:

- Reusable
- Easier maintenance
- Better readability

Example:

```text
tests/
└── fixtures/
    └── issue-event.json
```

---

## Test Setup and Teardown

### Setup

Prepare resources before tests run.

Examples:

- Create RabbitMQ connection
- Create channel
- Start consumer

### Teardown

Clean up resources after tests finish.

Examples:

- Close channel
- Close connection
- Stop consumers

Improper teardown may cause:

```text
A worker process has failed to exit gracefully
```

---

## RabbitMQ Concepts Learned

### Producer

Sends messages to a queue.

```text
Producer
 ↓
Queue
```

### Consumer

Receives messages from a queue.

```text
Queue
 ↓
Consumer
```

### Acknowledgement (Ack)

Confirms a message was processed successfully.

```text
Message
 ↓
Consumer
 ↓
Ack
```

Without ack:

```text
Unacked Messages
```

can accumulate in RabbitMQ.

### Queue Metrics

#### Ready

Messages waiting to be consumed.

#### Unacked

Messages delivered but not acknowledged.

#### Consumers

Number of active consumers attached to a queue.

---

## Common Problems Encountered

### Environment Variables Not Loaded

Symptom:

```text
RabbitMQ URL: undefined
```

Cause:

- Incorrect dotenv configuration
- Wrong .env path

---

### Multiple Consumers

Symptom:

```text
Consumers: 2
```

Unexpected behavior may occur when multiple consumers are attached to the same queue.

---

### Improper Cleanup

Symptom:

```text
Cannot read properties of undefined (reading 'close')
```

Cause:

- Setup failed
- Cleanup attempted to close resources that were never created

---

## CI/CD Integration

E2E tests should eventually run automatically in CI.

Example workflow:

```text
Push
 ↓
Install Dependencies
 ↓
Run Tests
 ↓
Pass / Fail
```

Benefits:

- Detect regressions early
- Prevent broken code from being merged
- Increase deployment confidence