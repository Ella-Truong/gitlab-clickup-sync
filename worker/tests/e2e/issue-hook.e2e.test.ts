/**
 * issue-event.json
 *       ↓
 * handleGitLabEvent()
 *       ↓
 * mockCreateClickUpTask()
 *       ↓
 *   Assertion
 * 
 */
import "../setup/mock-clickup";
import "../setup/mock-redis";

import { describe, it, expect, beforeEach} from "@jest/globals";
import issueEvent from "./fixtures/issue-event.json";
import { handleGitHubEvent} from "../../src/handler/github.handler";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { GitHubEvent } from "../../../shared/src/types/event.types";
import { mockSaveTaskId } from "../setup/mock-redis";

describe("Issue Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
        mockCreateClickUpTask.mockResolvedValue("task-123");
    })

    it("should create a ClickUp task when an issue is assigned", async () => {
        await handleGitHubEvent(issueEvent as GitHubEvent);
        expect(mockCreateClickUpTask).toHaveBeenCalledTimes(1);
        expect(mockSaveTaskId).toHaveBeenCalledTimes(1);
        expect(mockSaveTaskId).toHaveBeenCalledWith(123, "task-123");
    })
})
