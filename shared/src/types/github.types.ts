/**
 * Defines TypeScript types for GitHub webhook payloads.
 */
export interface GitHubUser {
    login: string;
}

export interface GitHubRepository {
    id: number;
    name: string;
}

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    created_at: string;
    assignees: GitHubUser[];
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

export interface GitHubIssuePayload {
    action: "assigned";
    issue: GitHubIssue;
    repository: GitHubRepository;
}

export interface GitHubPushPayload {
    ref: string;
    commits: GitHubCommit[];
    repository: GitHubRepository;
}

export interface GitHubPullRequestPayload {
    action: "opened" | "closed";
    pull_request: GitHubPullRequest;
    repository: GitHubRepository;
}

export type GitHubPayload = GitHubPushPayload | GitHubIssuePayload | GitHubPullRequestPayload