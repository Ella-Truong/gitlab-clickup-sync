/**
 * Define application events published to RabbitMQ
 */

import { GitHubPayload } from "./github.types";

export enum GitHubEventType {
    ISSUE = "issue",
    PUSH = "push",
    PULL_REQUEST = "pull_request",
}

export interface GitHubEvent {
    type: GitHubEventType,
    payload: GitHubPayload,
}