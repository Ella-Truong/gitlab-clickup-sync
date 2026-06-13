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
            break

        default:
            console.warn(`Unsupported evetn type: ${event.type}`)

    }
}

/**
 * Creating the task on ClickUp
 */

async function handleIssueAssigned(
    event: GitHubEvent
): Promise<void>{
    if(!("issue" in event.payload)){
        return;
    }
    
    await createClickUpTask({
        title: event.payload.issue.title,
        description: event.payload.body,
        assignee: event.payload.assignees.login,
        createdAt: event.payload.createdAt,
    });  
}

/**
 * Business rules for push events:
 * First commit -> Review
 * Third commit -> In Progress
 */

async function handlePushReceived(
    event: GitHubEvent
): Promise<void>{
    if(!("commits" in event.payload)){
        return;
    }
    
    for (const commit of event.payload.commits){
        const issueId = extractIssueId(commit.message);
        if (!issueId) continue;

        const task = await findTaskById(issueId);
        if (!task) continue;

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
 * Business rules for pull requests
 * PR opend -> Tesing
 * PR is merged -> Done
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