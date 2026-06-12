import { redis } from "../config/redis";

/**
 * Increment commit count for an issue
 */

export async function incrementCommitCount(
    issueId: number,
): Promise<number>{
    return redis.incr(
        `github:issue${issueId}:commits`,
    )
}

/**
 * get current commit count
 */

export async function getCommitCount(
    issueId: number,
): Promise<number>{
    const value = await redis.get(
        `github:issue${issueId}:commits`
    );

    return Number(value ?? 0)
}

/**
 * reset commit count
 */

export async function resetCommitCount(
    issueId: number,
): Promise<void>{
    await redis.del(
        `github:issue:${issueId}:commits`
    );
}