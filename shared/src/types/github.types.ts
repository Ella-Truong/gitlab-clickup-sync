/**
 * Defines TypeScript types for GitHub webhook payloads.
 */

export interface GitHubIssue {
    id: number;
    title: string;
}

export interface GitHubCommit {
    id: string;
    message: string;
}

export interface GitHubPullRequest {
    id: number;
    title: string;
    merged: boolean;
    body?: string | null;
}

export interface GitHubRepository {
    id: number;
    name: string;
}

export interface GitHubIssuePayload {
    action: string;
    assignee:{
        login: string;
    };
    issue: GitHubIssue;
    body: string;
    createdAt: string;
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