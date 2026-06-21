import {jest} from "@jest/globals";
import { deleteTaskId, getClickUpUserId, saveUserMapping } from "../../src/services/redis.service";

export const mockSaveUserMapping = jest.fn<(login: string, clickupUserId: number) => Promise<void>>();
export const mockGetClickUpUserId = jest.fn<(login: string) => Promise<number|null>>();

export const mockSaveTaskId = jest.fn<(issueNumber: number, taskId: string) => Promise<void>>();
export const mockGetTaskId = jest.fn<(issueNumber: number) => Promise<string | null>>();
export const mockDeleteTaskId = jest.fn<(issueNumber: number) => Promise<void>>();

export const mockIncrementCommitCount = jest.fn<(issueNumber: number) => Promise<number>>();
export const mockResetCommitCount = jest.fn<(issueNumber: number) => Promise<void>>();

export function resetRedisMocks(): void {
    mockSaveTaskId.mockReset();
    mockSaveUserMapping.mockReset();
    mockGetClickUpUserId.mockReset();
    mockGetTaskId.mockReset();
    mockDeleteTaskId.mockReset();
    mockIncrementCommitCount.mockReset();
    mockResetCommitCount.mockReset();
}

jest.mock("../../src/services/redis.service", () => ({
    saveUserMapping: mockSaveUserMapping,
    getClickUpUserId: mockGetClickUpUserId,
    incrementCommitCount: mockIncrementCommitCount,
    resetCommitCount: mockResetCommitCount,
    saveTaskId: mockSaveTaskId,
    getTaskId: mockGetTaskId,
    deleteTaskId: mockDeleteTaskId
}))