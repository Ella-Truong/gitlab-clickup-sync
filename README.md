## GitLab ↔ ClickUp Sync

A lightweight workflow automation service that synchronizes GitLab activity with ClickUp task statuses using GitLab webhooks.

Built to reduce manual status updates, minimize workflow interruptions, and improve engineering task visibility during development.

---

### Motivation

During development workflows, engineers often need to manually update task statuses in ClickUp after:

- opening Merge Requests
- pushing implementation commits
- merging completed work

Although this process is simple, repeated context switching between GitLab and ClickUp creates unnecessary workflow friction.

This project automates task status updates based on real GitLab activity.

---

### Workflow Rules

| GitLab Activity | ClickUp Status |
|---|---|
| Merge Request opened | `Review` |
| ≥ 3 commits pushed | `In Progress` |
| Merge Request merged | `Done` |
| No implementation activity | `Backlog` |

The system intentionally keeps workflow logic simple and predictable.

Human decisions such as:
- reassignment
- sprint planning
- prioritization
- blocked tasks

remain the responsibility of project managers and engineering leads.

---

### Example Workflow

```txt
Developer opens Merge Request
        ↓
GitLab webhook triggered
        ↓
System extracts ClickUp task ID
        ↓
ClickUp status updated to "Review"

**OR**
GitHub/GitLab
    ↓ (webhook event)
Your automation service
    ↓ (API call)
ClickUp
```

---

### Task Linking Convention

Tasks are linked between GitLab and ClickUp using shared task IDs.

Example:

**ClickUp Task**

```txt
CU-123 Implement authentication flow
```

**Git Branch**

```txt
feature/CU-123-auth-flow
```

**Merge Request**

```txt
[CU-123] Implement authentication flow
```

The service extracts the task ID and updates the corresponding ClickUp task automatically.

---

### Tech Stack

- Node.js
- Express.js
- GitLab Webhooks
- ClickUp API

---

### Core Features

- GitLab webhook listener
- Automatic ClickUp status synchronization
- Commit activity tracking
- Lightweight workflow rule engine
- Task ID extraction from branches/MRs

---

### Project Goals

- Reduce manual workflow overhead
- Minimize context switching
- Improve task visibility
- Encourage incremental development workflows
- Keep engineering coordination lightweight

---

### Future Improvements

Potential future enhancements:

- configurable workflow rules
- Slack notifications
- stale task detection
- review complexity indicators
- deployment event synchronization

The project intentionally avoids unnecessary complexity and focuses on reliable workflow automation.

---

### Why This Project Exists

This tool was created during a real engineering internship workflow where developers frequently forgot to manually update ClickUp task statuses after GitLab activity.

The goal is not to replace project management tools, but to reduce repetitive coordination work through lightweight automation.
