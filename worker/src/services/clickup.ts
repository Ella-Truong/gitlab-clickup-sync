/**
 * ClickUp API URLs
 * Authentication
 * Request payloads
 */

import { GitLabEvent } from "../../../shared/src/types/event.types";

/**
 * Create a new ClickUp task when a GitLab issue is assigned
 */
export async function createClickUpTask(
    event: GitLabEvent
): Promise<void>{
    console.log(`[ClickUP] Creating task for issue: ${event.title}`);

    //TODO
    //Call ClickUp API to create Task API
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