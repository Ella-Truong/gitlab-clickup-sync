import { describe, it, expect, beforeEach } from "@jest/globals";

import "../setup/mock-clickup";
import "../setup/mock-redis";

import mergedRequestEvent from "./fixtures/pr-event-merged.json";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import {
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { mockResetCommitCount, mockGetTaskId } from "../setup/mock-redis";
import { GitHubEvent } from "../../../shared/src/types/event.types";

describe("Pull Request Merged Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
        mockGetTaskId.mockResolvedValue("task-123");
    });

    it("should move task to Testing when pull request is opened", async () => {
        await handleGitHubEvent(
            mergedRequestEvent as GitHubEvent
        );

        expect(mockGetTaskId).toHaveBeenCalledWith(123);

        expect(mockMoveTaskToDone).toHaveBeenCalledTimes(1);
        
        expect(mockMoveTaskToDone).toHaveBeenCalledWith("task-123");
        
        expect(mockResetCommitCount).toHaveBeenCalledTimes(1);
        
        expect(mockResetCommitCount).toHaveBeenCalledWith(123);
    });
});