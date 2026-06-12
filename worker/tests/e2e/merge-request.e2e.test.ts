import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitHubEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitHubEvent } from "../../src/handler/github.handler";

import mergeRequestEvent from "./fixtures/pr-event-merged.json";
import openRequestEvent from "./fixtures/pr-event-opened.json";

import {
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";
import { GitHubPullRequestPayload } from "../../../shared/src/types/github.types";

describe("Merge Request Hook E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should move task to Testing when merge request is opened", async () => {

        await handleGitHubEvent(
            mergeRequestEvent as GitHubPullRequestPayload;
        );

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledWith(
                mergeRequestEvent.clickUpTaskId
            );
    });

    it("should move task to Done when merge request is merged", async () => {

        const mergedEvent: GitHubEvent = {
            ...(mergeRequestEvent as GitHubEvent),
            mergeRequestState: "merged",
        };

        await handleGitHubEvent(mergedEvent);

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledWith(
                mergedEvent.clickUpTaskId
            );
    });

});