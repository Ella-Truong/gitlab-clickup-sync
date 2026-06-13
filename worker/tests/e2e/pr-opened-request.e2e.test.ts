import "../setup/mock-clickup";

import { describe, it, expect, beforeEach } from "@jest/globals";
import openRequestEvent from "./fixtures/pr-event-opened.json";
import { handleGitHubEvent } from "../../src/handler/github.handler";

import {
    mockFindTaskById,
    mockMoveTaskToTesting,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { GitHubEvent } from "../../../shared/src/types/event.types";

describe("Pull Request Opened Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
        mockFindTaskById.mockResolvedValue({
            id: "task-123",
            name: "Test Task"
        })
    });

    it("should move task to Testing when pull request is opened", async () => {
        await handleGitHubEvent(
            openRequestEvent as GitHubEvent
        );

        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledTimes(1);
        
        expect(mockMoveTaskToTesting)
            .toHaveBeenCalledWith("task-123");
        
    });
});