/**
 * ClickUp API URLs
 * Authentication
 * Request payloads
 */

import { GitLabEvent } from "../../../shared/src/types/event.types";

const CLICKUP_API_URL = process.env.CLICKUP_API_URL;
const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID;

/**
 * Create a new ClickUp task when a GitLab issue is assigned
 */
export async function createClickUpTask(
    event: GitLabEvent
): Promise<void>{
    console.log(`[ClickUP] Creating task for issue: ${event.title}`);

    //TODO
    const res = await fetch(
        `${CLICKUP_API_URL}/list/${CLICKUP_LIST_ID}/task`,
        {
            method: "POST",

            headers: {
                Authorization: CLICKUP_TOKEN!,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: event.title,
                description: event.description,
                status: "To Do",
            }),
        }
    );

    if (!res.ok) {
        throw new Error(`ClickUp API error: ${res.status}`);
    }
    
    const task = await res.json();

    console.log(`Created ClickUp task ${task.id}`)
}

/**
 * Internal helper function for status updates
 */
async function updateTaskStatus(
    taskId: string,
    status: string,
): Promise<void>{
    const res = await fetch(
        `${CLICKUP_API_URL}/task/${taskId}`,
        {
            method: "PUT",
            headers: {
                Authorization: CLICKUP_TOKEN!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                status
            )
        }
    )
    if(!res.ok) {
        throw new Error(`ClickUp API error: , ${res.status}`);
    }
}


/**
 * Move task to Review when first commit is pushed
 */
export async function moveTaskToReview(
    event: GitLabEvent
): Promise<void>{
    console.log(`[ClickUp] Moving task to Review`);

    //TODO
    //Find that ClickUp task
    //Update status to "Review"
}

/**
 * Move task from Review to In Progress when commit count is 3
 */
export async function moveTaskToInProgress(
    event: GitLabEvent
): Promise<void>{
    console.log(`[ClickUp] Moving task to In Progress`);

    //TODO
    //Find that ClickUp task
    //Update status to "In Progress"
}


/**
 * Move task from In Progress to testing when a MR is opened
 */
export async function moveTaskToTesting(
    event: GitLabEvent
): Promise<void>{
    console.log(`[ClickUp] Moving task to Testing`);

    //TODO
    //Find that CLickUp task
    //Update status "Testing"
}

/**
 * Move task to Done when MR is merged.
 */
export async function moveTaskToDone(
    event: GitLabEvent
): Promise<void> {
    console.log(
        `[ClickUp] Moving task to Done`
    );

    // TODO
    // Find that ClickUp task
    // Update status to "Done"
}