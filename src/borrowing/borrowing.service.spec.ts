/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingService } from './borrowing.service';

// Mock the Prisma Client BEFORE importing the service
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      book: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      borrower: {
        findUnique: jest.fn(),
      },
      borrowRecord: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback: any) =>
        callback({
          book: { findUnique: jest.fn(), update: jest.fn() },
          borrower: { findUnique: jest.fn() },
          borrowRecord: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
          },
        }),
      ),
    })),
  };
});

describe('BorrowingService', () => {
  let service: BorrowingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowingService],
    }).compile();

    service = module.get<BorrowingService>(BorrowingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
