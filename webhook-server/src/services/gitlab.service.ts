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
    if(!payload.objectKind) {
        throw new Error("Missing required field: object_kind");
    }

    if(payload.project?.id == null) {
        throw new Error("Missing required field: project.id")
    };

    if(!payload.project?.name) {
        throw new Error("Missing required field: project.name")
    };

    if(!payload.resource?.title){
        throw new Error("Missing resource title")
    }
}

//determine event type
const determineEventType = (
    payload: GitLabPayload,
): GitLabEventType => {
    if(
        payload.objectKind === "issue" &&
        payload.assignees &&
        payload.assignees.length > 0
    ){
        return "issue-assigned";
    }

    if (payload.objectKind === "merge-request") return "merge-request";

    if (payload.objectKind === "push") return "push";

    throw new Error(`Unsupported event type: ${payload.objectKind}`)
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
    payload: GitLabPayload,
    eventType: GitLabEventType
): GitLabEvent => {
    return {
        source: "gitlab",
        eventType,

        clickUpTaskId: extractClickUpTaskId(
            payload.resource.title
        ),

        projectId: payload.project.id,
        projectName: payload.project.name,
        author: payload.userName,

        title: payload.resource.title,
        description: payload.resource.description,
        url: payload.resource.url,
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