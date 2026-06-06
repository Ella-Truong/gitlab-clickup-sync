import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitLabEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import pushEvent from "./fixtures/push-event.json";

import {
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    resetClickUpMocks,
} from "../setup/mock-clickup";

describe("Push Hook E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should move task to Review on first commit", async () => {

        await handleGitLabEvent(pushEvent as GitLabEvent);

        expect(mockMoveTaskToReview)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToReview)
            .toHaveBeenCalledWith(pushEvent.clickUpTaskId);
    });

    it("should move task to In Progress on third commit", async () => {

        const thirdCommitEvent: GitLabEvent = {
            ...(pushEvent as GitLabEvent),
            commitCount: 3,
        };

        await handleGitLabEvent(thirdCommitEvent);

        expect(mockMoveTaskToInProgress)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToInProgress)
            .toHaveBeenCalledWith(thirdCommitEvent.clickUpTaskId);
    });

});