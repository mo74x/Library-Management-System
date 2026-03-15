/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// Create mock functions we can reference in tests
const mockBorrower = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockBorrowRecord = {
  findFirst: jest.fn(),
};

// Mock the Prisma Client BEFORE importing the service
class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, { code }: { code: string }) {
    super(message);
    this.code = code;
  }
}

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      borrower: mockBorrower,
      borrowRecord: mockBorrowRecord,
    })),
    Prisma: {
      PrismaClientKnownRequestError,
    },
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersService } from './borrowers.service';

describe('BorrowersService', () => {
  let service: BorrowersService;

  beforeEach(async () => {
    // Clear all mock call history between tests
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowersService],
    }).compile();

    service = module.get<BorrowersService>(BorrowersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── CREATE ────────────────────────────────────────────────

  describe('create', () => {
    it('should create a new borrower', async () => {
      const dto = { name: 'Jane Doe', email: 'jane@example.com' };
      const expected = { id: 1, ...dto, registeredDate: new Date() };
      mockBorrower.create.mockResolvedValue(expected);

      const result = await service.create(dto as any);
      expect(result).toEqual(expected);
      expect(mockBorrower.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockBorrower.create.mockRejectedValue(
        new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)(
          'Unique constraint failed',
          { code: 'P2002' },
        ),
      );

      await expect(
        service.create({ name: 'Jane', email: 'dup@example.com' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── FIND ALL (PAGINATED) ─────────────────────────────────

  describe('findAll', () => {
    it('should return paginated borrowers with default page & limit', async () => {
      const borrowers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      ];
      mockBorrower.findMany.mockResolvedValue(borrowers);
      mockBorrower.count.mockResolvedValue(2);

      const result = await service.findAll();
      expect(result).toEqual({
        data: borrowers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockBorrower.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should respect custom page and limit', async () => {
      mockBorrower.findMany.mockResolvedValue([]);
      mockBorrower.count.mockResolvedValue(25);

      const result = await service.findAll(3, 5);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(5);
      expect(mockBorrower.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
    });
  });

  // ─── FIND ONE ─────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a single borrower if found', async () => {
      const borrower = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockBorrower.findUnique.mockResolvedValue(borrower);

      const result = await service.findOne(1);
      expect(result).toEqual(borrower);
    });

    it('should throw NotFoundException if borrower does not exist', async () => {
      mockBorrower.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the borrower', async () => {
      const existing = { id: 1, name: 'John', email: 'john@example.com' };
      const updated = { ...existing, name: 'John Updated' };
      mockBorrower.findUnique.mockResolvedValue(existing);
      mockBorrower.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'John Updated' } as any);
      expect(result.name).toBe('John Updated');
    });

    it('should throw NotFoundException if borrower to update does not exist', async () => {
      mockBorrower.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Ghost' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate email during update', async () => {
      mockBorrower.findUnique.mockResolvedValue({
        id: 1,
        name: 'John',
        email: 'john@example.com',
      });
      mockBorrower.update.mockRejectedValue(
        new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)(
          'Unique constraint failed',
          { code: 'P2002' },
        ),
      );

      await expect(
        service.update(1, { email: 'taken@example.com' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── REMOVE (WITH DELETION GUARD) ────────────────────────

  describe('remove', () => {
    it('should delete the borrower if no active borrows', async () => {
      const borrower = { id: 1, name: 'John', email: 'john@example.com' };
      mockBorrower.findUnique.mockResolvedValue(borrower);
      mockBorrowRecord.findFirst.mockResolvedValue(null);
      mockBorrower.delete.mockResolvedValue(borrower);

      const result = await service.remove(1);
      expect(result).toEqual(borrower);
      expect(mockBorrower.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if borrower does not exist', async () => {
      mockBorrower.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if borrower has unreturned books', async () => {
      const borrower = { id: 1, name: 'John', email: 'john@example.com' };
      mockBorrower.findUnique.mockResolvedValue(borrower);
      mockBorrowRecord.findFirst.mockResolvedValue({
        id: 10,
        borrowerId: 1,
        status: 'BORROWED',
      });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      // Ensure delete was never called
      expect(mockBorrower.delete).not.toHaveBeenCalled();
    });
  });
});
