/**
 * validate GitLab payload
 * transform data
 * publish event to RabbitMQ
 */

import { publishMessage } from "./rabbitmq.service";
import { GitHubPayload } from "../../../shared/src/types/gitlab.types";
import { GitHubEvent, GitHubEventType } from "../../../shared/src/types/event.types";

//validate payload
const validatePayload = (
    payload: GitHubPayload,
): void => {
    if(!payload.action) {
        throw new Error(`Missing required field: ${payload.action}`);
    }

    if(payload.project?.id == null) {
        throw new Error("Missing required field: project.id")
    };

    if(!payload.project?.name) {
        throw new Error("Missing required field: project.name")
    };

    if(!payload.issue?.title){
        throw new Error("Missing resource title")
    }
}

//determine event type
const determineEventType = (
    payload: GitHubPayload,
): GitHubEventType => {
    if(
        payload.action === "assigned" &&
        payload.assignees &&
        payload.assignees.length > 0
    ){
        return "issue-assigned";
    }

    if (payload.action === "merge-request") return "merge-request";

    if (payload.action === "push") return "push";

    throw new Error(`Unsupported event type: ${payload.action}`)
}

//extract ClickUpTaskId from title
const extractClickUpTaskId = (
    title: string,
): number =>{
    if(!title){
        throw new Error("Missing title")
    }

    //title form: [CU-123] Refactor Auth Flow
    const match = title.match(/\[CU-(\d+)\]/)

    if(!match) {
        throw new Error(`Invalid title format: ${title}`);
    }

    return Number(match[1]);
}

//transform payload
const transformPayload = (
    payload: GitHubPayload,
    eventType: GitHubEventType
): GitHubEvent => {
    return {
        source: "gitlab",
        eventType,

        clickUpTaskId: extractClickUpTaskId(
            payload.issue.title
        ),

        projectId: payload.project.id,
        projectName: payload.project.name,
        author: payload.userName,

        title: payload.issue.title,
        description: payload.issue.description,
        url: payload.issue.url,
    };
};


export const processWebhook = async (
    payload: GitHubPayload,
): Promise<void> => {
    validatePayload(payload);
    const eventType = determineEventType(payload);
    const event = transformPayload(payload, eventType);

    await publishMessage(event);
};