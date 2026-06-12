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
import { describe, it, expect, beforeEach} from "@jest/globals";
import { handleGitHubEvent} from "../../src/handler/github.handler";
import issueEvent from "./fixtures/issue-event.json";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { GitHubEvent } from "../../../shared/src/types/event.types";
import { GitHubIssuePayload } from "../../../shared/src/types/github.types";

describe("Issue Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
    })

    it("should create a ClickUp task when an issue is assigned", async () => {
        await handleGitHubEvent(issueEvent as GitHubEvent);
        expect(mockCreateClickUpTask)
    })

    it("should pass the event payload to createClickUpTask", async () => {
        await handleGitHubEvent(issueEvent as GitHubEvent);

        expect(mockCreateClickUpTask).toHaveBeenCalledWith(issueEvent as GitHubEvent)
    })
})
