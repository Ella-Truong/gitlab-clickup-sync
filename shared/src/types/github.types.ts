/**
 * Defines TypeScript types for GitLab webhook payloads.
 */

export enum GitHubEventType {
    ISSUES = "issues",
    PUSH = "push",
    PULL_REQUEST = "pull_request",
}

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
}

export interface GitHubRepository {
    name: string;
}

export interface GitHubIssuePayload {
    action: string;
    assignees:{
        login: string;
    }
    issue: GitHubIssue;
    description: string;
    repository: GitHubRepository;
}

export interface GitHubPushPayload {
    action: string;
    ref: string;
    commits: GitHubCommit[];
    repository: GitHubRepository;
    issue?: GitHubIssue;
}

export interface GitHubPullRequestPayload {
    action: string;
    pull_request: GitHubPullRequest;
    repository: GitHubRepository;
    issue?: GitHubIssue;
}

export type GitHubPayload = GitHubPushPayload | GitHubIssuePayload | GitHubPullRequestPayload