import { describe, it, expect, beforeEach } from "@jest/globals";
import type { GitLabEvent } from "../../../shared/src/types/event.types";

import "../setup/mock-clickup";

import { handleGitLabEvent } from "../../src/handler/gitlab.handler";

import issueEvent from "./fixtures/issue-event.json";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";

describe("Error Handling E2E", () => {

    beforeEach(() => {
        resetClickUpMocks();
    });

    it("should propagate ClickUp service errors", async () => {

        mockCreateClickUpTask.mockRejectedValueOnce(
            new Error("ClickUp API Error")
        );

        await expect(
            handleGitLabEvent(
                issueEvent as GitLabEvent
            )
        ).rejects.toThrow("ClickUp API Error");
    });

});