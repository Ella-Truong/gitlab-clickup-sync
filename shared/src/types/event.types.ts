/**
 * Define application events published to RabbitMQ
 */

import { GitHubPayload } from "./github.types";

export enum GitHubEventType {
    ISSUE_ASSIGNED = "issue.assigned",
    PUSH_RECEIVED = "push",
    PULL_REQUEST_OPENED = "pull_request.opened",
    PULL_REQUEST_MERGED = "pull_request.closed",
}

export interface GitHubEvent {
    type: GitHubEventType,
    payload: GitHubPayload
}