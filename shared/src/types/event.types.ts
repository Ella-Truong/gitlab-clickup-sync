/**
 * Define application events published to RabbitMQ
 */

export type GitHubEventType = "issue-assigned" | "push" | "merge-request";
export type MergeRequestState = "opened" | "merged";

export interface GitHubEvent {
    source: "gitlab";
    eventType: GitHubEventType;

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