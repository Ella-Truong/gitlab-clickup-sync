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