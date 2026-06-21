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
    number: number;    //source of truth
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
    head: {
        ref: string;
    };
    body?: string | null;
    merged: boolean;
}

export interface GitHubIssuePayload {
    action: "assigned" | "opened";
    issue: GitHubIssue;
    repository: GitHubRepository;
}

export interface GitHubPushPayload {
    ref: string;      //refs/heads/feature/<issue number>-<something> for commit push or refs/head/main for last push before open a PR
    created: boolean;
    commits: GitHubCommit[];
    repository: GitHubRepository;
}

export interface GitHubPullRequestPayload {
    action: "opened" | "closed";
    pull_request: GitHubPullRequest;
    repository: GitHubRepository;
}

export type GitHubPayload = GitHubPushPayload | GitHubIssuePayload | GitHubPullRequestPayload