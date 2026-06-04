/**
 * validate GitLab payload
 * transform data
 * publish event to RabbitMQ
 */

import { publishMessage } from "./rabbitmq.service";
import { GitLabPayload } from "../../../shared/src/types/gitlab.types";
import { GitLabEvent, GitLabEventType } from "../../../shared/src/types/event.types";

//validate payload
const validatePayload = (
    payload: GitLabPayload,
): void => {
    if(!payload.object_kind) {
        throw new Error("Missing required field: object_kind");
    }

    if(!payload.project.id) {
        throw new Error("Missing required field: project.id")
    };

    if(!payload.project.name) {
        throw new Error("Missing required field: project.name")
    };
}

//determine event type
const determineEventType = (
    payload: GitLabPayload,
): GitLabEventType => {
    if(
        payload.object_kind === "issue" &&
        payload.assignees &&
        payload.assignees.length > 0
    ){
        return "issue-assigned";
    }

    if (payload.object_kind === "merge-request") return "merge-request";

    if (payload.object_kind === "push") return "push";

    throw new Error(`Unsupported event type: ${payload.object_kind}`)
}

//transform payload
const transformPayload = (
    payload: GitLabPayload,
    eventType: GitLabEventType
): GitLabEvent => {
    return {
        source: "gitlab",
        eventType,
        projectId: payload.project.id,
        projectName: payload.project.name,
        title: payload.object_attributes?.title,
        description: payload.object_attributes?.description,
        author: payload.user_name ?? "Unknown"
    };
};


export const processWebhook = async (
    payload: GitLabPayload,
): Promise<void> => {
    validatePayload(payload);
    const eventType = determineEventType(payload);
    const event = transformPayload(payload, eventType);

    await publishMessage(event);
};