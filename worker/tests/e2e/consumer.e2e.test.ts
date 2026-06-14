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
        /**
         * start RabbitMQ test infrastructure
         * launch the consumer before running tests
         */
        jest.clearAllMocks();
        await setupRabbitMQ();
        await startConsumer();

    });
    
    /**
     * close RabbitMQ resources after all tests complete
     */
    afterAll(async () => {
        await cleanupRabbitMQ();
    });

    it("should consume GitHub event from RabbitMQ", async () => {
        /**
         * publish the test event to the queue
         * this simulates the webhook-server publishing
         */
        await publishMessage(issueEvent);
        
        /**
         * give RabbitMQ and the consumer time
         * to process the message asynchronously
         */
        await new Promise(resolve =>
            setTimeout(resolve, 500)
        );

        /**
         * verify that the consumer forwarded the message to GitHub handler
         */
        expect(mockHandleGitHubEvent).toHaveBeenCalledTimes(1);

        /**
         * verify that the original payload was passed the handler unchanged
         */
        expect(mockHandleGitHubEvent).toHaveBeenCalledWith(issueEvent);
    });
});