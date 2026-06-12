/**
 * Extract issue Id from text -> return a number 
 * 
 * [#123] Implemement RabbitMQ Worker --> 123
 * #123 Add RabbitMQ publisher --> 123
 * Fix bug for #456 --> 456
 */

export function extractIssueId(
    text: string
): number | null {
    const match = text.match(/#(\d+)/);
    if(!match) {
        return null;
    }

    return Number(match[1])
}