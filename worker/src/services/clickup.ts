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
    const res = await fetch(
        `${CLICKUP_API_URL}/list/${CLICKUP_LIST_ID}/task`,
        {
            method: "POST",

            headers: {
                Authorization: CLICKUP_TOKEN!,
                "Content-Type": "application/json",
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
    taskId: number,
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
    taskId: number,
): Promise<void>{
    await updateTaskStatus(taskId, "Review")
}

/**
 * Move task from Review to In Progress when commit count is 3
 */
export async function moveTaskToInProgress(
    taskId: number,
): Promise<void>{
    await updateTaskStatus(taskId, "In Progress")
}


/**
 * Move task from In Progress to testing when a MR is opened
 */
export async function moveTaskToTesting(
    taskId: number,
): Promise<void>{
    await updateTaskStatus(taskId, "Testing")
}

/**
 * Move task to Done when MR is merged.
 */
export async function moveTaskToDone(
    taskId: number,
): Promise<void> {
    await updateTaskStatus(taskId, "Done")
}