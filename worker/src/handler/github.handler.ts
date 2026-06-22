/**
 * Decide what business action to perform
 * Understand event types
 * Business rules
 * Workflow decisions
*/

import { 
    GitHubEvent,
    GitHubEventType,
    GitHubIssueEvent,
    GitHubPushEvent,
    GitHubPullRequestEvent
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
    incrementCommitCount, 
    getClickUpUserId,
    deleteTaskId
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
            console.warn(`Unsupported event type: ${event}`)
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
    event: GitHubIssueEvent
): Promise<void>{
    if(!("issue" in event.payload)){
        return;
    }
    
    const issue = event.payload.issue;
    const issueNumber = issue.number;

    const clickUpUserIds = (
        await Promise.all(
            issue.assignees.map(
                assignee => getClickUpUserId(assignee.login)
            )
        )
    ).filter((id): id is number => id !== null)

    //use one service of ClickUp - createClickUpTask()
    const taskId = await createClickUpTask({
        title: `Task [${issueNumber}] - ${issue.title}`,
        description: issue.body ?? "",
        createdAt: issue.created_at,
        assignees: clickUpUserIds,
    });  
    
    //use Redis service 
    await saveTaskId(issueNumber, taskId);
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
    event: GitHubPushEvent
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
    event: GitHubPullRequestEvent,
): Promise<void>{
   if (!("pull_request" in event.payload)){
    return;
   }
   
   const pull_request = event.payload.pull_request;

   const issueNumber = extractIssueNumber(pull_request.head.ref);
   if (!issueNumber) return;

   const taskId = await getTaskId(issueNumber);
   if (!taskId) return;

   switch (event.payload.action){
    case "opened":
        await moveTaskToTesting(taskId);
        break;
    case "closed":
        if(!pull_request.merged){
            return;
        }

        await moveTaskToDone(taskId);
        await resetCommitCount(issueNumber);
        break;
   }
}
