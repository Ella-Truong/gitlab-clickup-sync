import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitHubEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitHubEvent } from "../../src/handler/github.handler";

import issueEvent from "./fixtures/issue-event.json";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";
import { GitHubIssuePayload } from "../../../shared/src/types/github.types";

describe("Error Handling E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
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