/**
 * Define application events published to RabbitMQ
 */

export type GitLabEventType = "issue-assigned" | "push" | "merge-request";
export type MergeRequestState = "opened" | "merged";

export interface GitLabEvent {
    source: "gitlab";
    eventType: GitLabEventType;
    projectId?: number;
    projectName?: string;
    author?: string;
    title?: string;
    issueId?: number;
    description?: string;
    commitCount?: number;
    mergeRequestState?: MergeRequestState;
}