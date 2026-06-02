/**
 * Defines TypeScript types for GitLab webhook payloads.
 */

export interface GitLabPayload {
    object_kind: string;
    event_type?: string;

    user_name?: string;

    project?: {
        id: number;
        name: string;
        web_url?: string;
    }

    object_attributes?: {
        id: number;
        title?: string;          //Refactor Auth Flow
        description?: string;
        state?: string;    
        action?: string;
        url?: string;
    };
}