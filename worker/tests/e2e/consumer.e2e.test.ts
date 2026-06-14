import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { startConsumer } from "../../src/consumers/githubEventConsumer";
import issueEvent from "./fixtures/issue-event.json";

import {
    setupRabbitMQ,
    publishMessage,
    cleanupRabbitMQ,
} from "../setup/test-rabbitmq";

jest.mock("../../src/handler/github.handler", () => ({
    handleGitHubEvent: jest.fn()
}))
import { handleGitHubEvent } from "../../src/handler/github.handler";

const mockHandleGitHubEvent = handleGitHubEvent as jest.Mock;

describe("GitHub Event Consumer E2E", () => {

    beforeAll(async () => {
        await setupRabbitMQ();
        await startConsumer();

    });

    afterAll(async () => {
        await cleanupRabbitMQ();
    });

    it("should consume GitHub event from RabbitMQ", async () => {

        await publishMessage(issueEvent);

        await new Promise(resolve =>
            setTimeout(resolve, 500)
        );

        expect(mockHandleGitHubEvent).toHaveBeenCalledTimes(1);
        expect(mockHandleGitHubEvent).toHaveBeenCalledWith(issueEvent);
    });
});