import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitLabEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import mergeRequestEvent from "./fixtures/mr-event.json";

import {
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

describe("Merge Request Hook E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should move task to Testing when merge request is opened", async () => {

        await handleGitLabEvent(
            mergeRequestEvent as GitLabEvent
        );

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledWith(
                mergeRequestEvent.clickUpTaskId
            );
    });

    it("should move task to Done when merge request is merged", async () => {

        const mergedEvent: GitLabEvent = {
            ...(mergeRequestEvent as GitLabEvent),
            mergeRequestState: "merged",
        };

        await handleGitLabEvent(mergedEvent);

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledTimes(1);

        expect(mockMoveTaskToDone)
            .toHaveBeenCalledWith(
                mergedEvent.clickUpTaskId
            );
    });

});