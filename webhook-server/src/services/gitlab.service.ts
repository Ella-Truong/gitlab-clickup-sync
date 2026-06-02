/**
 * validate GitLab payload
 * transform data
 * publish event to RabbitMQ
 */

import { publishMessage } from "./rabbitmq.service";
import { GitLabPayload } from "../types/gitlab.types";
import { GitLabEvent } from "../types/event.types";

//validate payload
const validatePayload = (
    payload: GitLabPayload,
): void => {
    if(!payload.object_kind) {
        throw new Error("Missing required field: object_kind");
    }
}

//transform payload
const transformPayload = (
    payload: GitLabPayload,
): GitLabEvent => {
    return {
        source: "gitlab",
        eventType: payload.object_kind,
        projectName: payload.project?.name,
        title: payload.object_attributes?.title,
        description: payload.object_attributes?.description,
        author: payload.user_name
    };
};


export const processWebhook = async (
    payload: GitLabPayload,
): Promise<void> => {
    validatePayload(payload);
    const event = transformPayload(payload);

    await publishMessage(event);
};