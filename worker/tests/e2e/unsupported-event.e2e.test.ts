import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import "../setup/mock-clickup";

import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import {
    mockCreateClickUpTask,
    mockMoveTaskToReview,
    mockMoveTaskToInProgress,
    mockMoveTaskToTesting,
    mockMoveTaskToDone,
    resetClickUpMocks,
} from "../setup/mock-clickup";

describe("Unsupported Event E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should ignore unsupported event types", async () => {

        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        const unsupportedEvent = {
            source: "gitlab",
            eventType: "unknown-event",
            clickUpTaskId: 101,
            projectId: 1,
            projectName: "Test Project",
            author: "Ella",
        };

        await handleGitLabEvent(
            unsupportedEvent as any
        );

        expect(warnSpy).toHaveBeenCalled();

        expect(mockCreateClickUpTask)
            .not.toHaveBeenCalled();

        expect(mockMoveTaskToReview)
            .not.toHaveBeenCalled();

        expect(mockMoveTaskToInProgress)
            .not.toHaveBeenCalled();

        expect(mockMoveTaskToTesting)
            .not.toHaveBeenCalled();

        expect(mockMoveTaskToDone)
            .not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

});