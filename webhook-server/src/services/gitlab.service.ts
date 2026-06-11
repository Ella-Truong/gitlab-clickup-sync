/**
 * validate GitLab payload
 * transform data
 * publish event to RabbitMQ
 */

import { publishMessage } from "./rabbitmq.service";
import { GitHubEventType, GitHubPayload} from "../../../shared/src/types/github.types";
import { GitHubEvent } from "../../../shared/src/types/event.types";

//validate payload
const validatePayload = (
    eventType: GitHubEventType,
    payload: GitHubPayload,
): void => {
    switch (eventType) {
        case GitHubEventType.ISSUES:
            if(!("issues" in payload)){
                throw new Error("Missing issue payload")
            }

            if(!payload.issue?.id){
                throw new Error("Missing issue.id")
            }

            if(!payload.issue?.title){
                throw new Error("Missing issue.title")
            }

            break;

        case GitHubEventType.PUSH:
            if(!("commits" in payload)){
                throw new Error("Missing commits payload")
            }

            if(!payload.commits?.length){
                throw new Error("Push event contains no commits")
            }

            break;

        case GitHubEventType.PULL_REQUEST:
            if(!("pull_request" in payload)){
                throw new Error("Missing pull_request payload")
            }

            if(!payload.pull_request?.id){
                throw new Error("Missing pull_request.id")
            }

            break;
        
        default: throw new Error(`Unsupported event type: ${eventType}`)
    }
}

//transform payload
const transformPayload = (
    payload: GitHubPayload,
    eventType: GitHubEventType
): GitHubEvent => {
    return {
        type: eventType,
        payload,
    }
};


export const processWebhook = async (
    payload: GitHubPayload,
    eventType: GitHubEventType,
): Promise<void> => {
    validatePayload(eventType, payload);
    const event = transformPayload(payload, eventType);

    await publishMessage(event);
};