/**
 * validate GitLab payload
 * transform data
 * publish event to RabbitMQ
 */

import { publishMessage } from "./rabbitmq.service";
import { GitHubPayload } from "../../../shared/src/types/github.types";
import { GitHubEventType, GitHubEvent } from "../../../shared/src/types/event.types";

//validate payload
const validatePayload = (
    webhookType: string,
    payload: GitHubPayload,
): void => {
    switch (webhookType) {
        case "issues":
            if(!("issue" in payload)){
                throw new Error("Missing issue payload")
            }

            if(!payload.issue.id){
                throw new Error("Missing issue.id")
            } 

            if(!payload.issue.title){
                throw new Error("Missing issue.title")
            }

            break;

        case "push":
            if(!("commits" in payload)){
                throw new Error("Missing commits payload")
            }

            if(!payload.commits.length){
                throw new Error("Push event contains no commits")
            }

            break;

        case "pull_request":
            if(!("pull_request" in payload)){
                throw new Error("Missing pull_request payload")
            }

            if(!payload.pull_request.id){
                throw new Error("Missing pull_request.id")
            }

            if(!payload.pull_request.title){
                throw new Error("Missing pull_request.title")
            }

            break;
        
        default: throw new Error(`Unsupported event type: ${webhookType}`)
    }
}

//convert GitHub webhook into business event
const determineEventType = (
    webhookType: string,
    payload: GitHubPayload
): GitHubEventType => {
    if(webhookType === "issues" && "action" in payload && payload.action === "assigned"){
        return GitHubEventType.ISSUE_ASSIGNED;
    }

    if(webhookType === "push"){
        return GitHubEventType.PUSH_RECEIVED;
    }

    if(webhookType === "pull_request" && "action" in payload && payload.action === "opened"){
        return GitHubEventType.PULL_REQUEST_OPENED;
    }  

    if(webhookType === "pull_request" && "action" in payload && payload.action === "merged"){
        return GitHubEventType.PULL_REQUEST_MERGED;
    }

    throw new Error(`Unsupported event: ${webhookType}`)
}


export const processWebhook = async (
    payload: GitHubPayload,
    webhookType: string,
): Promise<void> => {
    validatePayload(webhookType, payload);
    const eventType = determineEventType(webhookType, payload)
    const event: GitHubEvent = {
        type: eventType,
        payload
    }

    await publishMessage(event);
};