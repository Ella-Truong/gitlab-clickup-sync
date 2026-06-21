export interface ClickUpTaskStatus {
    status: string;
}

export interface ClickUpTask {
    id: string;
    name: string;
    status?: ClickUpTaskStatus;
}

export interface ClickUpTaskListResponse {
    tasks: ClickUpTask[];
}

export interface ClickUpTaskInput {
    title: string;
    description: string | null;
    assignees: number[];
    createdAt: string;
}

export interface ClickUpUser {
    id: number;
    username: string;
}