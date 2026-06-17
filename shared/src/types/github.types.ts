/**
 * Defines TypeScript types for GitHub webhook payloads.
 */

export interface GitHubIssue {
    id: number;
    title: string;
    body: string;
    created_at: string;
    assignees: [
        {
            login: string;
        }
    ]
}

export interface GitHubCommit {
    id: string;
    message: string;
}

export interface GitHubPullRequest {
    id: number;
    title: string;
    body?: string | null;
}

export interface GitHubRepository {
    id: number;
    name: string;
}

export interface GitHubIssuePayload {
    action: string;
    issue: GitHubIssue;
    repository: GitHubRepository;
}

export interface GitHubPushPayload {
    ref: string;
    commits: GitHubCommit[];
    repository: GitHubRepository;
}

export interface GitHubPullRequestPayload {
    action: string;
    pull_request: GitHubPullRequest;
    repository: GitHubRepository;
}

export type GitHubPayload = GitHubPushPayload | GitHubIssuePayload | GitHubPullRequestPayload