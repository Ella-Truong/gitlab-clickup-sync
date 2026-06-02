/**
 * Define application events published to RabbitMQ
 */

export interface GitLabEvent {
    source: "gitlab";
    eventType: string;
    projectName?: string;
    title?: string;
    description?: string;
    author?: string;
}