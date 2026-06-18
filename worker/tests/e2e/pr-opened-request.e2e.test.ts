import "../setup/mock-clickup";
import "../setup/mock-redis";

import { describe, it, expect, beforeEach } from "@jest/globals";
import openRequestEvent from "./fixtures/pr-event-opened.json";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import {

    mockMoveTaskToTesting,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { GitHubEvent } from "../../../shared/src/types/event.types";
import { mockGetTaskId } from "../setup/mock-redis";

describe("Pull Request Opened Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
        mockGetTaskId.mockResolvedValue("task-123");
    });

    it("should move task to Testing when pull request is opened", async () => {
        await handleGitHubEvent(
            openRequestEvent as GitHubEvent
        );
        
        expect(mockGetTaskId).toHaveBeenCalledWith(123);
        expect(mockMoveTaskToTesting).toHaveBeenCalledTimes(1);
        expect(mockMoveTaskToTesting).toHaveBeenCalledWith("task-123");
        
    });
});