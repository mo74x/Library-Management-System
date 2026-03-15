import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

@Controller('borrowing')
@UseGuards(ThrottlerGuard)
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('checkout')
  checkout(@Body() checkoutBookDto: CheckoutBookDto) {
    return this.borrowingService.checkout(checkoutBookDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('return/:recordId')
  returnBook(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.borrowingService.returnBook(recordId);
  }

  @Get('borrower/:borrowerId')
  findCurrentByBorrower(@Param('borrowerId', ParseIntPipe) borrowerId: number) {
    return this.borrowingService.findCurrentByBorrower(borrowerId);
  }

  @Get('overdue')
  findOverdueBooks() {
    return this.borrowingService.findOverdueBooks();
  }

  @Get('export/borrows')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=last-month-borrows.csv')
  async exportBorrows(@Res() res: Response) {
    const csv = await this.borrowingService.exportLastMonthBorrows();
    res.send(csv);
  }

  @Get('export/overdue')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=last-month-overdue.csv')
  async exportOverdue(@Res() res: Response) {
    const csv = await this.borrowingService.exportLastMonthOverdue();
    res.send(csv);
  }
}
