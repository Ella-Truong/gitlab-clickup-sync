/**
 * Decide what business action to perform
 * Understand event types
 * Business rules
 * Workflow decisions
*/
import { GitLabEvent } from "../../../shared/src/types/event.types";
import {
    createClickUpTask,
    moveTaskToDone,
    moveTaskToInProgress,
    moveTaskToReview,
    moveTaskToTesting,
} from "../services/clickup.service";


export async function handleGitLabEvent(event: GitLabEvent): Promise<void>{
    console.log(`Processing ${event.eventType} event from ${event.projectName}`);

    switch (event.eventType) {
        case "issue-assigned":
            await createClickUpTask(event);
            break;
        
        case "push":
            await handlePushEvent(event);
            break;
        
        case "merge-request":
            await handleMergeRequestEvent(event);
            break;

        default:
            console.warn(`Unsupported evetn type: ${event.eventType}`)

    }
}


/**
 * Business rules for push events:
 * First commit -> Review
 * Third commit -> In Progress
 */
async function handlePushEvent(
    event: GitLabEvent
): Promise<void>{
    if(!event.commitCount){
        return;
    }

    if(event.commitCount === 1){
        await moveTaskToReview(event.clickUpTaskId);
        return;
    }

    if(event.commitCount === 3){
        await moveTaskToInProgress(event.clickUpTaskId);
        return;
    }
}

/**
 * Business rules for merge request
 * MR opend -> Tesing
 * MR is merged -> Done
 */
async function handleMergeRequestEvent(
    event: GitLabEvent
): Promise<void>{
    if(event.mergeRequestState === "opened"){
        await moveTaskToTesting(event.clickUpTaskId)
        return;
    }

    if(event.mergeRequestState === "merged"){
        await moveTaskToDone(event.clickUpTaskId)
        return;
    }
}