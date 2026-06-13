import { describe, it, expect, beforeEach } from "@jest/globals";

import "../setup/mock-clickup";
import "../setup/mock-redis";

import type { GitHubEvent } from "../../../shared/src/types/event.types";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import issueEvent from "./fixtures/issue-event.json";
import pushEvent from "./fixtures/push-event.json";
import mergeRequestEvent from "./fixtures/pr-event-merged.json";
import openRequestEvent from "./fixtures/pr-event-opened.json";

import {
    mockCreateClickUpTask,
    mockFindTaskById,
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import {
    mockIncrementCommitCount,
    mockResetCommitCount,
} from "../setup/mock-redis";


describe("GitLab to ClickUp Workflow E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
        mockFindTaskById.mockResolvedValue({
            id: "task-123",
            name: "[#123] Test Task"
        })
    });

    it("should process the complete GitLab to ClickUp workflow", async () => {

        // Issue Assigned -> Create Task
        await handleGitHubEvent(issueEvent as GitHubEvent);
        expect(mockCreateClickUpTask).toHaveBeenCalledTimes(1);

        //first commit -> review
        mockIncrementCommitCount.mockResolvedValueOnce(1);
        await handleGitHubEvent(pushEvent as GitHubEvent);
        expect(mockMoveTaskToReview).toHaveBeenCalledTimes(1);

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

});