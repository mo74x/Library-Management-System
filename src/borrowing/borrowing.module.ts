import { Module } from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { BorrowingController } from './borrowing.controller';

@Module({
  providers: [BorrowingService],
  controllers: [BorrowingController]
})
export class BorrowingModule {}
