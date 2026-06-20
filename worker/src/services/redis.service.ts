import { redis } from "../config/redis";

/**
 * Mapping: Github login --> ClickUp user ID
 */
export async function saveUserMapping(
    login: string,
    clickUpUserId: number
): Promise<void>{
    await redis.hset(
        "github:users",
        login,
        clickUpUserId.toString()
    );
}


/**
 * Get ClickUp user ID from Gitub login
 */
export async function getClickUpUserId(
    login: string,
): Promise<number | null>{
    const clickupUserId = await redis.hget(
        "github:users",
        login
    )

    return clickupUserId? Number(clickupUserId) : null;
}


/**
 * Store GitHub issue number -> ClickUp task ID
 */
export async function saveTaskId(
    issueNumber: number,
    taskId: string,
): Promise<void>{
    await redis.set(
        `github:issue:${issueNumber}:task-id`,
        taskId
    );
}


/**
 * Retrieve ClickUp task ID by GitHub issue number
 */
export async function getTaskId(
    issueNumber: number,
): Promise<string | null>{
    return await redis.get(
        `github:issue:${issueNumber}:task-id`
    );
}

/**
 * Increment commit count for an issue
 */
export async function incrementCommitCount(
    issueNumber: number,
): Promise<number>{
    return await redis.incr(
        `github:issue:${issueNumber}:commits`,
    )
}


/**
 * Get current commit count
 */
export async function getCommitCount(
    issueNumber: number,
): Promise<number>{
    const value = await redis.get(
        `github:issue:${issueNumber}:commits`
    );

    return Number(value ?? 0)
}


/**
 * Reset commit count after PR merged
 */

export async function resetCommitCount(
    issueNumber: number,
): Promise<void>{
    await redis.del(
        `github:issue:${issueNumber}:commits`
    );
}


/**
 * Delete task ID
 */
export async function deleteTaskId(
    issueNumber: number
): Promise<void>{
    await redis.del(
        `github:issue:${issueNumber}:task-id`
    );
}