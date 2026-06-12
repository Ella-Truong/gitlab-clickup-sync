/**
 * ClickUp API URLs
 * Authentication
 * Request payloads
 */
import { getEnv } from "../config/env";
import { 
    ClickUpTask, 
    ClickUpTaskListResponse,
    CreateClickUpTaskInput,
} from "../../../shared/src/types/clickup.types";
import { GitHubIssue, GitHubIssuePayload } from "../../../shared/src/types/github.types";

/**
 * Create a new ClickUp task when a GitLab issue is assigned
 */
export async function createClickUpTask(
    input: CreateClickUpTaskInput
): Promise<string>{
    const {
        clickupApiUrl,
        clickupToken,
        clickupListId,
    } = getEnv();

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
                description: `
                Assignee: ${input.assignee ?? "Unassigned"}
                Created At: ${input.createdAt} 

                ${input.description ?? ""}`,
                status: "To Do",
            }),
        }
    );
    
    if (!res.ok) {
        throw new Error(`ClickUp API error: ${res.status}`);
    }
    
    const task = await res.json() as ClickUpTask;
    return task.id;
}

export async function findTaskById(
    issueId: number
): Promise<ClickUpTask | null>{
    const {
        clickupApiUrl,
        clickupToken,
        clickupListId
    } = getEnv();

    const res = await fetch(
        `${clickupApiUrl}/list/${clickupListId}/task`,
        {
            headers:{
                Authorization: clickupToken
            },
        }
    )

    if (!res.ok){
        throw new Error(`ClickUp API error: ${res.status}`)
    }

    const data = await res.json() as ClickUpTaskListResponse;

    return (
        data.tasks.find(task => task.name.startsWith(`[#${issueId}]`)) ?? null
    );
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