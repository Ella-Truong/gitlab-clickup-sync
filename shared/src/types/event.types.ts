/**
 * Define application events published to RabbitMQ
 */

import { GitHubEventType, GitHubPayload } from "./github.types";

export interface GitHubEvent{
    type: GitHubEventType;
    payload: GitHubPayload
}