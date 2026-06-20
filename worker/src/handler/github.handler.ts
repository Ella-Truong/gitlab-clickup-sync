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

import {extractIssueNumber} from "../../utils/extractIssueNumber";



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
        case GitHubEventType.ISSUE:
            await handleIssueEvent(event);
            break;
        
        case GitHubEventType.PUSH:
            await handlePushEvent(event);
            break;

        case GitHubEventType.PULL_REQUEST:
            await handlePullRequestEvent(event);
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
async function handleIssueEvent(
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
async function handlePushEvent(
    event: GitHubEvent
): Promise<void>{
    if(!("commits" in event.payload)){
        return;
    }
    
    //ignore merge pushes to main
    if (event.payload.ref === "refs/heads/main"){
        return;
    }

    //refs/heads/feature/5-implement-login
    const issueNumber = extractIssueNumber(event.payload.ref);
    if(!issueNumber) return;

    const taskId = await getTaskId(issueNumber);
    if(!taskId) return;

    const commitCount = await incrementCommitCount(issueNumber);
    if(commitCount === 1){
        await moveTaskToReview(taskId);
    }

    if(commitCount === 3) 
    {
        await moveTaskToInProgress(taskId);
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
async function handlePullRequestEvent (
    event: GitHubEvent,
): Promise<void>{
   if (!("pull_request" in event.payload)){
    return;
   }

   const issueNumber = extractIssueNumber(event.payload.pull_request.head.ref);
   if (!issueNumber) return;

   const taskId = await getTaskId(issueNumber);
   if (!taskId) return;


   switch (event.payload.action){
    case "opened":
        await moveTaskToTesting(taskId);
        break;
    case "closed":
        if(!event.payload.pull_request.merged){
            return;
        }

        await moveTaskToDone(taskId);
        await resetCommitCount(issueNumber);
        break;
   }
}
