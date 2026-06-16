/**
 * Define application events published to RabbitMQ
 */

import { 
    GitHubIssuePayload,
    GitHubPayload,
    GitHubPullRequestPayload,
    GitHubPushPayload
 } from "./github.types";

export enum GitHubEventType {
    ISSUE_ASSIGNED = "issue.assigned",
    PUSH_RECEIVED = "push.received",
    PULL_REQUEST_OPENED = "pull_request.opened",
    PULL_REQUEST_MERGED = "pull_request.merged",
}

export interface GitHubEvent {
    type: GitHubEventType,
    payload: GitHubPayload
}