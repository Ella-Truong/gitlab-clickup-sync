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
import { handleGitLabEvent} from "../../src/handler/gitlab.handler";
import issueEvent from "./fixtures/issue-event.json";

import {
    mockCreateClickUpTask,
    resetClickUpMocks,
} from "../setup/mock-clickup";

import { GitLabEvent } from "../../../shared/src/types/event.types";

describe("Issue Hook E2E", () => {
    beforeEach(() => {
        resetClickUpMocks();
    })

    it("should create a ClickUp task when an issue is assigned", async () => {
        await handleGitLabEvent(issueEvent as GitLabEvent);
        expect(mockCreateClickUpTask)
    })

    it("should pass the event payload to createClickUpTask", async () => {
        await handleGitLabEvent(issueEvent as GitLabEvent);

        expect(mockCreateClickUpTask).toHaveBeenCalledWith(issueEvent as GitLabEvent)
    })
})
