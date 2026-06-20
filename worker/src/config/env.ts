// src/config/env.ts

export function getEnv() {
    return {
      clickupApiUrl: process.env.CLICKUP_API_BASE_URL!,
      clickupToken: process.env.CLICKUP_API_TOKEN!,
      clickupListId: process.env.CLICKUP_LIST_ID!,
      rabbitmqUrl: process.env.RABBITMQ_URL!,
      clickupTeamId: process.env.CLICKUP_TEAM_ID!,
    };
  }