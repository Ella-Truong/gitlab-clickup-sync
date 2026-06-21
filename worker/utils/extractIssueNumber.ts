/**
 * Extract issue Id from text title -> return a number 
 * 
 * [#123] Implemement RabbitMQ Worker --> 123
 * [#123] Add RabbitMQ publisher --> 123
 * Fix bug for [#456] --> 456
 */

export function extractIssueNumber(
    branchName: string
): number | null {
    const match = branchName.match(/(\d+)/);

    return match? Number(match[1]) : null;
}