import { redis } from "../config/redis";

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
    return redis.incr(
        `github:issue:${issueNumber}:commits`,
    )
}

/**
 * get current commit count
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
 * reset commit count
 */

export async function resetCommitCount(
    issueNumber: number,
): Promise<void>{
    await redis.del(
        `github:issue:${issueNumber}:commits`
    );
}