/**
 * ClickUp API URLs
 * Authentication
 * Request payloads
 */
import { getEnv } from "../config/env";
import { 
    ClickUpTask, 
    ClickUpTaskListResponse,
    ClickUpTaskInput,
} from "../../../shared/src/types/clickup.types";


/**---------------- Services --------------- */

/*Create a new ClickUp task when a GitLab issue is assigned*/
export async function createClickUpTask(
    input: ClickUpTaskInput
): Promise<string>{
    const {
        clickupApiUrl,
        clickupToken,
        clickupListId,
    } = getEnv();

    console.log("title:", input.title);
    console.log("description:", input.description);
    console.log("input:", input);

    const res = await fetch(
        `${clickupApiUrl}/list/${clickupListId}/task`,
        {
            method: "POST",
            headers: {
                Authorization: clickupToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: input.title,
                markdown_content: input.description,
                status: "To Do",
            }), 
        }
    );
    
    if (!res.ok) {
        const errorText = await res.text();

        console.error("ClickUp response:", errorText);
        throw new Error(`ClickUp API error: ${res.status}`);
    }
    
    const task = await res.json() as ClickUpTask;
    return task.id;
}


/**
 * Internal helper function for status updates
 */
async function updateTaskStatus(
    taskId: string,
    status: string,
): Promise<void>{
    const {clickupApiUrl, clickupToken} = getEnv();

    const res = await fetch(
        `${clickupApiUrl}/task/${taskId}`,
        {
            method: "PUT",
            headers: {
                Authorization: clickupToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                status,
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
    taskId: string,
): Promise<void>{
    await updateTaskStatus(taskId, "Review")
}

/**
 * Move task from Review to In Progress when commit count is 3
 */
export async function moveTaskToInProgress(
    taskId: string,
): Promise<void>{
    await updateTaskStatus(taskId, "In Progress")
}


/**
 * Move task from In Progress to testing when a MR is opened
 */
export async function moveTaskToTesting(
    taskId: string,
): Promise<void>{
    await updateTaskStatus(taskId, "Testing")
}

/**
 * Move task to Done when MR is merged.
 */
export async function moveTaskToDone(
    taskId: string,
): Promise<void> {
    await updateTaskStatus(taskId, "Done")
}