import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitHubEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";
import "../setup/mock-redis";

import { handleGitHubEvent } from "../../src/handler/github.handler";

import issueEvent from "./fixtures/issue-event.json";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import {
    mockGetClickUpUserId,
} from "../setup/mock-redis";

describe("Error Handling E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
        mockGetClickUpUserId.mockResolvedValue(87654321)
    });

    it("should propagate ClickUp service errors", async () => {

        mockCreateClickUpTask.mockRejectedValueOnce(
            new Error("ClickUp API Error")
        );

        await expect(
            handleGitHubEvent(
                issueEvent as GitHubEvent
            )
        ).rejects.toThrow("ClickUp API Error");
    });

});