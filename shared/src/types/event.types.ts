/**
 * Define application events published to RabbitMQ
 */

export type GitLabEventType = "issue-assigned" | "push" | "merge-request";
export type MergeRequestState = "opened" | "merged";

export interface GitLabEvent {
    source: "gitlab";
    eventType: GitLabEventType;

    clickUpTaskId: number;

    projectId: number;
    projectName: string;
    author: string;

    gitlabObjectId?: number;
    url?: string;

    title?: string;
    description?: string;

    commitCount?: number;
    mergeRequestState?: MergeRequestState;
}