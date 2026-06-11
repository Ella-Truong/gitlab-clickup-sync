/**
 * Defines TypeScript types for GitLab webhook payloads.
 */

export type GitHubObjectKind = "assigned" | "push" | "merge-request"

export interface GitHubPayload {
    action: s
    userName: string;

    project: {
        id: number;
        name: string;
        webUrl?: string;
    }

    commits?: GitLabCommit[];
    assignees?: GitLabAssignee[];

    issue: {
        id: number;
        title: string;          // ex: Refactor Auth Flow
        description?: string;
        state?: string;    
        action?: string;
        url?: string;
    };
}

export interface GitLabCommit {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    authorName?: string;
    authorEmail?: string;
}

export interface GitLabAssignee {
    id: number;
    name: string;
    username?: string;
}