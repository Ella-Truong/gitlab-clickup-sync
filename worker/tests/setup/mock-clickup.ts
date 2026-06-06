/**
 * ClickUp Service Mock
 *
 * Purpose:
 * Replace the real ClickUp service during tests.
 *
 * Production Flow:
 * GitLab Event
 *      ↓
 * handleGitLabEvent()
 *      ↓
 * Real ClickUp Service
 *      ↓
 * Real ClickUp API
 *
 * Test Flow:
 * GitLab Event
 *      ↓
 * handleGitLabEvent()
 *      ↓
 * Mock ClickUp Service
 *      ↓
 * Fake Functions (jest.fn)
 *
 * Benefits:
 * - No real API calls
 * - No ClickUp credentials required
 * - No test tasks created in ClickUp
 * - Faster and more reliable tests
 *
 * IMPORTANT:
 * Only mock exported functions from clickup.service.ts.
 * Internal functions such as updateTaskStatus() cannot be mocked directly
 * because they are not exported.
 */

import { jest } from "@jest/globals";

/**
 * Fake functions used to replace the real ClickUp service methods.
 *
 * Jest automatically records:
 * - How many times the function was called
 * - What arguments were passed
 * - The order of calls
 *
 * Example:
 * expect(mockCreateClickUpTask).toHaveBeenCalledTimes(1);
 * expect(mockMoveTaskToReview).toHaveBeenCalledWith(101);
 */
export const mockCreateClickUpTask = jest.fn();
export const mockMoveTaskToReview = jest.fn();
export const mockMoveTaskToInProgress = jest.fn();
export const mockMoveTaskToTesting = jest.fn();
export const mockMoveTaskToDone = jest.fn();

/**
 * Reset all mock call history before each test.
 *
 * Without this:
 *
 * Test A
 *   -> createClickUpTask called once
 *
 * Test B
 *   -> createClickUpTask still shows previous call
 *
 * This ensures every test starts with a clean state.
 */
export function resetClickUpMocks(): void {
    mockCreateClickUpTask.mockClear();
    mockMoveTaskToReview.mockClear();
    mockMoveTaskToInProgress.mockClear();
    mockMoveTaskToTesting.mockClear();
    mockMoveTaskToDone.mockClear();
}

/**
 * Replace the real ClickUp service module with mock functions.
 *
 * When the handler imports:
 *
 * import {
 *   createClickUpTask,
 *   moveTaskToReview,
 *   moveTaskToInProgress,
 *   moveTaskToTesting,
 *   moveTaskToDone
 * } from "../services/clickup.service";
 *
 * Jest automatically substitutes:
 *
 * createClickUpTask()      -> mockCreateClickUpTask()
 * moveTaskToReview()       -> mockMoveTaskToReview()
 * moveTaskToInProgress()   -> mockMoveTaskToInProgress()
 * moveTaskToTesting()      -> mockMoveTaskToTesting()
 * moveTaskToDone()         -> mockMoveTaskToDone()
 *
 * As a result, tests can verify business behavior without
 * contacting the real ClickUp API.
 */
jest.mock("../../src/services/clickup.service", () => ({
    createClickUpTask: mockCreateClickUpTask,
    moveTaskToReview: mockMoveTaskToReview,
    moveTaskToInProgress: mockMoveTaskToInProgress,
    moveTaskToTesting: mockMoveTaskToTesting,
    moveTaskToDone: mockMoveTaskToDone,
}));