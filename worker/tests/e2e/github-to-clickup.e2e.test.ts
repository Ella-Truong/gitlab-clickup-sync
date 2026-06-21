import { describe, it, expect, beforeEach } from "@jest/globals";

import "../setup/mock-clickup";
import "../setup/mock-redis";

import type { GitHubEvent } from "../../../shared/src/types/event.types";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import issueEvent from "./fixtures/issue-event.json";
import pushEvent from "./fixtures/push-event.json";
import mergeRequestEvent from "./fixtures/pr-event-merged.json";
import openRequestEvent from "./fixtures/pr-event-opened.json";
import unsupportedRequestEvent from "./fixtures/unsupported-event.json";

import {
    mockCreateClickUpTask,
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import {
    mockIncrementCommitCount,
    mockResetCommitCount,
    mockGetTaskId,
    mockSaveTaskId,
    mockGetClickUpUserId,
    resetRedisMocks,
} from "../setup/mock-redis";


describe("GitHub to ClickUp Workflow E2E", () => {

    beforeEach(() => {
        resetRedisMocks();
        resetClickUpMocks();

        mockCreateClickUpTask.mockResolvedValue("task-123");
        mockGetClickUpUserId.mockResolvedValue(87654321);
        mockGetTaskId.mockResolvedValue("task-123");
    });

    it("should process the complete GitHub to ClickUp workflow", async () => {

        // Issue Assigned -> Create Task
        await handleGitHubEvent(issueEvent as GitHubEvent);
        expect(mockGetClickUpUserId).toHaveBeenCalledWith("Ella-Truong")
        expect(mockCreateClickUpTask).toHaveBeenCalledTimes(1);
        expect(mockSaveTaskId).toHaveBeenCalledWith(123, "task-123");

        //first commit -> review
        mockIncrementCommitCount.mockResolvedValueOnce(1);
        await handleGitHubEvent(pushEvent as GitHubEvent);
        expect(mockGetTaskId).toHaveBeenCalledWith(123);
        expect(mockMoveTaskToReview).toHaveBeenCalledWith("task-123");

        // Third Commit -> In Progress
        mockIncrementCommitCount.mockResolvedValueOnce(3);
        await handleGitHubEvent(pushEvent as GitHubEvent);
        expect(mockMoveTaskToInProgress).toHaveBeenCalledWith("task-123");

        // PR Opened -> Testing
        await handleGitHubEvent(openRequestEvent as GitHubEvent);
        expect(mockMoveTaskToTesting).toHaveBeenCalledWith("task-123");

        // PR Merged -> Done
        await handleGitHubEvent(mergeRequestEvent as GitHubEvent);
        expect(mockMoveTaskToDone).toHaveBeenCalledWith("task-123");
        expect(mockResetCommitCount).toHaveBeenCalledWith(123);
    });

    it("should ignore unsupported events", async () => {
        await handleGitHubEvent(
            unsupportedRequestEvent as GitHubEvent
        )

        expect(mockCreateClickUpTask).not.toHaveBeenCalled();
        expect(mockMoveTaskToReview).not.toHaveBeenCalled();
        expect(mockMoveTaskToInProgress).not.toHaveBeenCalled();
        expect(mockMoveTaskToTesting).not.toHaveBeenCalled();
        expect(mockMoveTaskToDone).not.toHaveBeenCalled();
    })

});