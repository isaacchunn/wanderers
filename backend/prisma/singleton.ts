import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Import your actual db connection
import { db } from '../controllers/db'

// Mock the db import
jest.mock('../controllers/db', () => ({
    __esModule: true,
    db: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(prismaMock)
})

export const prismaMock = db as unknown as DeepMockProxy<PrismaClient>