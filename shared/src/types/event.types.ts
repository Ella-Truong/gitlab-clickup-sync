/**
 * Define application events published to RabbitMQ
 */

import { GitHubPayload } from "./github.types";

export enum GitHubEventType {
    ISSUE_ASSIGNED = "issue.assigned",
    PUSH = "push",
    PULL_REQUEST_OPENED = "pull_request.opened",
    PULL_REQUEST_CLOSED = "pull_request.closed",
}

export interface GitHubEvent {
    type: GitHubEventType,
    payload: GitHubPayload
}