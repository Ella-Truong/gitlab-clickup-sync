/**
 * Decide what business action to perform
 * Understand event types
 * Business rules
 * Workflow decisions
*/

import { 
    GitHubEventType,
    GitHubEvent 
} from "../../../shared/src/types/event.types";

import {
    createClickUpTask,
    moveTaskToDone,
    moveTaskToInProgress,
    moveTaskToReview,
    moveTaskToTesting,
} from "../services/clickup.service";

import { 
    saveTaskId,
    getTaskId,
    resetCommitCount,
    incrementCommitCount 
} from "../services/redis.service";

import {extractIssueId} from "../../utils/extractIssueId";



/**
 * Routes GitHub events to their corresponding handlers.
 *
 * Each GitHubEvent contains:
 * - a type identifying the GitHub event
 * - a payload containing event-specific data
 *
 * Different event types are processed by different handlers.
 */
export async function handleGitHubEvent(event: GitHubEvent): Promise<void>{
    switch (event.type) {
        case GitHubEventType.ISSUE_ASSIGNED:
            await handleIssueAssigned(event);
            break;
        
        case GitHubEventType.PUSH:
            await handlePushReceived(event);
            break;

        case GitHubEventType.PULL_REQUEST_OPENED:
            await handlePullRequestOpened(event);
            break;

        case GitHubEventType.PULL_REQUEST_CLOSED:
            await handlePullRequestClosed(event);
            break;

        default:
            console.warn(`Unsupported evetn type: ${event.type}`)

    }
}



/**
 * Handles GitHub issue assignment events.
 *
 * When an issue is assigned, a corresponding task is created in ClickUp.
 *
 * Validation:
 * - Ignore payloads that do not contain issue data.
 *
 * Uses the ClickUp service to create the task.
 */
async function handleIssueAssigned(
    event: GitHubEvent
): Promise<void>{
    if(!("issue" in event.payload)){
        return;
    }

    const issueNumber = event.payload.issue.number;

    //use the service of creating task of ClickUp
    const clickUpTaskWithIssueNumber = await createClickUpTask({
        title: `[#${issueNumber}] ${event.payload.issue.title}`,
        description: event.payload.issue.body,
        createdAt: event.payload.issue.created_at,
        assignees: event.payload.issue.assignees.map(
            assignee => assignee.login
        )
    });  

    await saveTaskId(issueNumber, clickUpTaskWithIssueNumber);
}



/**
 * Handles GitHub push events.
 *
 * Validation:
 * - Ignore payloads without commits.
 * - Ignore commits that do not reference an issue ID.
 * - Ignore issues that cannot be mapped to a ClickUp task.
 *
 * Workflow:
 * - 1st commit  -> move task to Review
 * - 3rd commit  -> move task to In Progress
 *
 * Commit counts are tracked in Redis.
 */
async function handlePushReceived(
    event: GitHubEvent
): Promise<void>{
    if(!("commits" in event.payload)){
        return;
    }
    
    for (const commit of event.payload.commits){
        const issueNumber = extractIssueId(commit.message);  //return ID task (number)
        if (!issueNumber) continue;

        const taskId = await getTaskId(issueNumber);   //use returned ID to find that task (ClickUpTask type)
        if (!taskId) continue;

        //use Redis services
        const commitCount = await incrementCommitCount(issueNumber);
        if (commitCount === 1) {
            await moveTaskToReview(taskId);
        }
        if(commitCount === 3){
            await moveTaskToInProgress(taskId);
        }
    }
    
}



/**
 * Business rules for pull request events:
 *
 * - Pull request opened  -> move task to Testing
 * - Pull request merged  -> move task to Done
 *
 * The related ClickUp task is identified by extracting
 * the issue ID from the pull request title.
 *
 * When a pull request is merged, the Redis commit counter
 * is cleared because the development workflow is complete.
 */
async function handlePullRequestOpened (
    event: GitHubEvent,
): Promise<void>{
   if (!("pull_request" in event.payload)){
    return;
   }

   const issueNumber = extractIssueId(event.payload.pull_request.title);
   if(!issueNumber) return;

   const taskId = await getTaskId(issueNumber);
   if (!taskId) return;

   await moveTaskToTesting(taskId);

}

async function handlePullRequestClosed (
    event: GitHubEvent,
): Promise<void>{
    if(!("pull_request" in event.payload)){
        return;
    }

    const issueNumber = extractIssueId(event.payload.pull_request.title)
    if(!issueNumber) return;

    const taskId = await getTaskId(issueNumber);
    if(!taskId) return;

    await moveTaskToDone(taskId);
    await resetCommitCount(issueNumber);
}