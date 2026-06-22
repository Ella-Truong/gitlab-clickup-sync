/**
 * Define application events published to RabbitMQ
 */

import { 
    GitHubIssuePayload, 
    GitHubPushPayload, 
    GitHubPullRequestPayload
} from "./github.types";

export enum GitHubEventType {
    ISSUE = "issue",
    PUSH = "push",
    PULL_REQUEST = "pull_request",
}
export interface GitHubIssueEvent {
    type: GitHubEventType.ISSUE;
    payload: GitHubIssuePayload;
}

export interface GitHubPushEvent {
    type: GitHubEventType.PUSH;
    payload: GitHubPushPayload;
}

export interface GitHubPullRequestEvent {
    type: GitHubEventType.PULL_REQUEST;
    payload: GitHubPullRequestPayload;
}

export type GitHubEvent =
    | GitHubIssueEvent
    | GitHubPushEvent
    | GitHubPullRequestEvent;