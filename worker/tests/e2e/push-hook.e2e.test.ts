import "../setup/mock-clickup";
import "../setup/mock-redis";

import { describe, it, expect, beforeEach } from "@jest/globals";
import pushEvent from "./fixtures/push-event.json";
import type { GitHubEvent } from "../../../shared/src/types/event.types";

import { handleGitHubEvent } from "../../src/handler/github.handler";

import {
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    resetClickUpMocks,
    mockFindTaskById,
} from "../setup/mock-clickup";

import { mockIncrementCommitCount } from "../setup/mock-redis";

describe("Push Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should move task to Review on first commit", async () => {
        mockFindTaskById.mockResolvedValue({
            id: "task-123",
            name: "Test Task"
        });

        mockIncrementCommitCount.mockResolvedValue(1);

        await handleGitHubEvent(pushEvent as GitHubEvent);

        expect(mockMoveTaskToReview)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToReview)
            .toHaveBeenCalledWith("task-123");
    });

    it("should move task to In Progress on third commit", async () => {
        mockFindTaskById.mockResolvedValue({
            id: "task-123",
            name: "Test Task",
        })

        mockIncrementCommitCount.mockResolvedValue(3);

        await handleGitHubEvent(pushEvent as GitHubEvent);

        expect(mockMoveTaskToInProgress)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToInProgress)
            .toHaveBeenCalledWith("task-123");
    });
});