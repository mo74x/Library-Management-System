import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingController } from './borrowing.controller';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BorrowingService } from './borrowing.service';

// Mock Prisma globally for this test suite
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

describe('BorrowingController', () => {
  let controller: BorrowingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowingController],
      providers: [
        {
          provide: BorrowingService,
          useValue: {
            checkout: jest.fn(),
            returnBook: jest.fn(),
            findCurrentByBorrower: jest.fn(),
            findOverdueBooks: jest.fn(),
            exportBorrowsData: jest.fn(),
            exportOverdueData: jest.fn(),
            exportBorrowsXlsx: jest.fn(),
            exportOverdueXlsx: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BorrowingController>(BorrowingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
