import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

import "../setup/mock-clickup";
import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import issueEvent from "./fixtures/issue-event.json";

import { startConsumer } from "../../src/consumers/gitlabEventConsumer";

import {
    setupRabbitMQ,
    publishMessage,
    cleanupRabbitMQ,
} from "../setup/test-rabbitmq";

import {
    mockCreateClickUpTask,
} from "../setup/mock-clickup";

import { GitLabEvent } from "../../../shared/src/types/event.types";

describe("Consumer E2E", () => {

    beforeAll(async () => {
        await setupRabbitMQ();
        await startConsumer();

    });

    afterAll(async () => {
        await cleanupRabbitMQ();
    });

    it("should consume RabbitMQ messages and create ClickUp tasks", async () => {

        await publishMessage(issueEvent);

        await new Promise(resolve =>
            setTimeout(resolve, 500)
        );

        expect(mockCreateClickUpTask)
            .toHaveBeenCalledTimes(1);
    });

});