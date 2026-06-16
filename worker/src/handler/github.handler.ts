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
    findTaskById,
    moveTaskToDone,
    moveTaskToInProgress,
    moveTaskToReview,
    moveTaskToTesting,
} from "../services/clickup.service";

import { 
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
        
        case GitHubEventType.PUSH_RECEIVED:
            await handlePushReceived(event);
            break;

        case GitHubEventType.PULL_REQUEST_OPENED:
            await handlePullRequestOpened(event);
            break;

        case GitHubEventType.PULL_REQUEST_MERGED:
            await handlePullRequestMerged(event);
            break;

        default:
            console.warn(`Unsupported evetn type: ${event}`)

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
    
    //use the service of creating task of ClickUp
    await createClickUpTask({
        title: event.payload.issue.title,
        description: event.payload.issue.body,
        createdAt: event.payload.issue.created_at,
        assignee: event.payload.issue.assignees.map(
            assignee => assignee.login
        )

    });  
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
        const issueId = extractIssueId(commit.message);  //return ID task (number)
        if (!issueId) continue;

        const task = await findTaskById(issueId);   //use returned ID to find that task (ClickUpTask type)
        if (!task) continue;

        //use Redis services
        const commitCount = await incrementCommitCount(issueId);
        if (commitCount === 1) {
            await moveTaskToReview(task.id);
        }
        if(commitCount === 3){
            await moveTaskToInProgress(task.id);
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

   const issueId = extractIssueId(event.payload.pull_request.title);
   if(!issueId) return;

   const task = await findTaskById(issueId);
   if (!task) return;

   await moveTaskToTesting(task.id);

}

async function handlePullRequestMerged (
    event: GitHubEvent,
): Promise<void>{
    if(!("pull_request" in event.payload)){
        return;
    }

    const issueId = extractIssueId(event.payload.pull_request.title)
    if(!issueId) return;

    const task = await findTaskById(issueId);
    if(!task) return;

    await moveTaskToDone(task.id);
    await resetCommitCount(issueId);
}