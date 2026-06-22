export function normalizeUsername(username: string): string {
    return username
        .toLowerCase()
        .replace(/-/g, " ")
        .trim();
}