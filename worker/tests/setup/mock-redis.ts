import {jest} from "@jest/globals";

export const mockIncrementCommitCount = jest.fn<(issueId: number) => Promise<number>>();
export const mockResetCommitCount = jest.fn<(issueId: number) => Promise<void>>();

jest.mock("../../src/services/redis.service", () => ({
    incrementCommitCount: mockIncrementCommitCount,
    resetCommitCount: mockResetCommitCount,
}))