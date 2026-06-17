import { publishMessage } from "./rabbitmq.service";

import {
    GitHubIssuePayload,
    GitHubPullRequestPayload,
    GitHubPushPayload,
    GitHubPayload,
} from "../../../shared/src/types/github.types";

import {
    GitHubEvent,
    GitHubEventType,
} from "../../../shared/src/types/event.types";

/**
 * Validate webhook payload
 */
const validatePayload = (
    webhookType: string,
    payload: GitHubPayload,
): void => {
    switch (webhookType) {
        case "issues":
            if (!("issue" in payload)) {
                throw new Error("Missing issue payload");
            }

            if (!payload.issue.id) {
                throw new Error("Missing issue.id");
            }

            if (!payload.issue.title) {
                throw new Error("Missing issue.title");
            }

            break;

        case "push":
            if (!("commits" in payload)) {
                throw new Error("Missing commits payload");
            }

            if (!payload.commits.length) {
                throw new Error("Push event contains no commits");
            }

            break;

        case "pull_request":
            if (!("pull_request" in payload)) {
                throw new Error("Missing pull_request payload");
            }

            if (!payload.pull_request.id) {
                throw new Error("Missing pull_request.id");
            }

            if (!payload.pull_request.title) {
                throw new Error("Missing pull_request.title");
            }

            break;

        default:
            throw new Error(`Unsupported event type: ${webhookType}`);
    }
};

/**
 * Build a strongly typed business event
 */
const buildEvent = (
    webhookType: string,
    payload: GitHubPayload,
): GitHubEvent => {
    if (
        webhookType === "issues" &&
        "action" in payload &&
        payload.action === "assigned"
    ) {
        return {
            type: GitHubEventType.ISSUE_ASSIGNED,
            payload: payload as GitHubIssuePayload,
        };
    }

    if (webhookType === "push") {
        return {
            type: GitHubEventType.PUSH_RECEIVED,
            payload: payload as GitHubPushPayload,
        };
    }

    if (
        webhookType === "pull_request" &&
        "action" in payload &&
        payload.action === "opened"
    ) {
        return {
            type: GitHubEventType.PULL_REQUEST_OPENED,
            payload: payload as GitHubPullRequestPayload,
        };
    }

    if (
        webhookType === "pull_request" &&
        "action" in payload &&
        payload.action === "closed"
    ) {
        return {
            type: GitHubEventType.PULL_REQUEST_MERGED,
            payload: payload as GitHubPullRequestPayload,
        };
    }

    throw new Error(`Unsupported event: ${webhookType}`);
};

export const processWebhook = async (
    payload: GitHubPayload,
    webhookType: string,
): Promise<void> => {
    validatePayload(webhookType, payload);

    const event = buildEvent(webhookType, payload);

    await publishMessage(event);
};