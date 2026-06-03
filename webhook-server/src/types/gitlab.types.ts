/**
 * Defines TypeScript types for GitLab webhook payloads.
 */

export type GitLabObjectKind = "issue" | "push" | "merge-request"

export interface GitLabPayload {
    object_kind: GitLabObjectKind;
    user_name?: string;

    project: {
        id: number;
        name: string;
        web_url?: string;
    }

    commits?: GitLabCommit[];
    assignees?: GitLabAssignee[];

    object_attributes?: {
        id: number;
        title?: string;          // ex: Refactor Auth Flow
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
}

export interface GitLabAssignee {
    id: number;
    name: string;
}