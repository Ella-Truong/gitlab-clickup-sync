import {jest} from "@jest/globals";

export const mockIncrementCommitCount = jest.fn<(issueNumber: number) => Promise<number>>();
export const mockResetCommitCount = jest.fn<(issueNumber: number) => Promise<void>>();
export const mockSaveTaskId = jest.fn<(issueNumber: number, taskId: string) => Promise<void>>();
export const mockGetTaskId = jest.fn<(issueNumber: number) => Promise<string | null>>();

jest.mock("../../src/services/redis.service", () => ({
    incrementCommitCount: mockIncrementCommitCount,
    resetCommitCount: mockResetCommitCount,
    saveTaskId: mockSaveTaskId,
    getTaskId: mockGetTaskId,
}))