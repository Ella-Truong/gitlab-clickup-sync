import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitLabEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import issueEvent from "./fixtures/issue-event.json";
import pushEvent from "./fixtures/push-event.json";
import mergeRequestEvent from "./fixtures/mr-event.json";

import {
    mockCreateClickUpTask,
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

describe("GitLab to ClickUp Workflow E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should process the complete GitLab to ClickUp workflow", async () => {

        // Issue Assigned -> Create Task
        await handleGitLabEvent(
            issueEvent as GitLabEvent
        );

        expect(mockCreateClickUpTask)
            .toHaveBeenCalledTimes(1);

        // First Commit -> Review
        await handleGitLabEvent(
            pushEvent as GitLabEvent
        );

        expect(mockMoveTaskToReview)
            .toHaveBeenCalledTimes(1);

        // Third Commit -> In Progress
        const thirdCommitEvent: GitLabEvent = {
            ...(pushEvent as GitLabEvent),
            commitCount: 3,
        };

        await handleGitLabEvent(thirdCommitEvent);

        expect(mockMoveTaskToInProgress)
            .toHaveBeenCalledTimes(1);

        // MR Opened -> Testing
        await handleGitLabEvent(
            mergeRequestEvent as GitLabEvent
        );

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledTimes(1);

        // MR Merged -> Done
        const mergedEvent: GitLabEvent = {
            ...(mergeRequestEvent as GitLabEvent),
            mergeRequestState: "merged",
        };

        await handleGitLabEvent(mergedEvent);

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledTimes(1);
    });

});