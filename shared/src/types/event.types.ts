/**
 * Define application events published to RabbitMQ
 */

import { 
    GitHubIssuePayload,
    GitHubPullRequestPayload,
    GitHubPushPayload
 } from "./github.types";

export enum GitHubEventType {
    ISSUE_ASSIGNED = "issue.assigned",
    PUSH_RECEIVED = "push.received",
    PULL_REQUEST_OPENED = "pull_request.opened",
    PULL_REQUEST_MERGED = "pull_request.merged",
}

export type GitHubEvent =
  | {
      type: GitHubEventType.ISSUE_ASSIGNED;
      payload: GitHubIssuePayload;
    }
  | {
      type: GitHubEventType.PUSH_RECEIVED;
      payload: GitHubPushPayload;
    }
  | {
      type: GitHubEventType.PULL_REQUEST_OPENED;
      payload: GitHubPullRequestPayload;
    }
  | {
      type: GitHubEventType.PULL_REQUEST_MERGED;
      payload: GitHubPullRequestPayload;
    };