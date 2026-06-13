import "../setup/mock-clickup";
import "../setup/mock-redis";

import { describe, it, expect, beforeEach } from "@jest/globals";
import mergedRequestEvent from "./fixtures/pr-event-merged.json";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import {
    mockFindTaskById,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { mockResetCommitCount } from "../setup/mock-redis";
import { GitHubEvent } from "../../../shared/src/types/event.types";

describe("Pull Request Merged Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
        mockFindTaskById.mockResolvedValue({
            id: "task-123",
            name: "#101 Test Task"
        })
    });

    it("should move task to Testing when pull request is opened", async () => {
        await handleGitHubEvent(
            mergedRequestEvent as GitHubEvent
        );

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledTimes(1);
        
        expect(mockMoveTaskToDone)
            .toHaveBeenCalledWith("task-123");
        
        expect(mockResetCommitCount)
            .toHaveBeenCalledTimes(1);
        
        expect(mockResetCommitCount)
            .toHaveBeenCalledWith(101);
    });
});