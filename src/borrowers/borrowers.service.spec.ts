/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersService } from './borrowers.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      borrower: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    })),
  };
});

describe('BorrowersService', () => {
  let service: BorrowersService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowersService],
    }).compile();

    service = module.get<BorrowersService>(BorrowersService);
    // Grab the mocked Prisma instance to control its returns
    prisma = (service as any).prisma =
      new (require('@prisma/client').PrismaClient)();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of borrowers', async () => {
      const expectedBorrowers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
      ];
      prisma.borrower.findMany.mockResolvedValue(expectedBorrowers);

      const result = await service.findAll();
      expect(result).toEqual(expectedBorrowers);
      expect(prisma.borrower.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single borrower if found', async () => {
      const borrower = { id: 1, name: 'John Doe', email: 'john@example.com' };
      prisma.borrower.findUnique.mockResolvedValue(borrower);

      const result = await service.findOne(1);
      expect(result).toEqual(borrower);
    });

    it('should throw a NotFoundException if borrower is not found', async () => {
      prisma.borrower.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
