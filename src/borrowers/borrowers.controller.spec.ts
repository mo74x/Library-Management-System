import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersController } from './borrowers.controller';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BorrowersService } from './borrowers.service';

// Mock Prisma globally for this test suite
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

describe('BorrowersController', () => {
  let controller: BorrowersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowersController],
      providers: [
        {
          provide: BorrowersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BorrowersController>(BorrowersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
