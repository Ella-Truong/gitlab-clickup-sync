import {jest} from "@jest/globals";

export const mockIncrementCommitCount = jest.fn<(issueId: number) => Promise<number>>();
export const mockResetCommitCount = jest.fn();

jest.mock("../../src/services/redis.services", () => ({
    incrementCommitCount: mockIncrementCommitCount,
    resetCommitCount: mockResetCommitCount,
}))