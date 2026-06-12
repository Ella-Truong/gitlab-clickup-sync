/**
 * Defines TypeScript types for GitHub webhook payloads.
 */

export interface GitHubIssue {
    id: number;
    title: string;
    body: string | null;
}

export interface GitHubCommit {
    id: string;
    message: string;
}

export interface GitHubPullRequest {
    id: number;
    title: string;
    merged: boolean;
    body: string | null;
}

export interface GitHubRepository {
    id: number;
    name: string;
}

export interface GitHubIssuePayload {
    action: string;
    assignees:{
        login: string;
    };
    issue: GitHubIssue;
    description: string;
    repository: GitHubRepository;
}

export interface GitHubPushPayload {
    action: string;
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