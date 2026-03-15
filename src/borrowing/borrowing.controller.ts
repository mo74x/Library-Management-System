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
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Borrowing')
@Controller('borrowing')
@UseGuards(ThrottlerGuard)
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @ApiOperation({ summary: 'Checkout a book for a borrower' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('checkout')
  checkout(@Body() checkoutBookDto: CheckoutBookDto) {
    return this.borrowingService.checkout(checkoutBookDto);
  }

  @ApiOperation({ summary: 'Return a borrowed book' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('return/:recordId')
  returnBook(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.borrowingService.returnBook(recordId);
  }

  @ApiOperation({
    summary: 'List current books borrowed by a specific borrower',
  })
  @Get('borrower/:borrowerId')
  findCurrentByBorrower(@Param('borrowerId', ParseIntPipe) borrowerId: number) {
    return this.borrowingService.findCurrentByBorrower(borrowerId);
  }

  @ApiOperation({ summary: 'List books that are overdue' })
  @Get('overdue')
  findOverdueBooks() {
    return this.borrowingService.findOverdueBooks();
  }

  @ApiOperation({ summary: "Export last month's borrows process to CSV" })
  @Get('export/borrows')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=last-month-borrows.csv')
  async exportBorrows(@Res() res: Response) {
    const csv = await this.borrowingService.exportLastMonthBorrows();
    res.send(csv);
  }

  @ApiOperation({ summary: "Export last month's overdue books to CSV" })
  @Get('export/overdue')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=last-month-overdue.csv')
  async exportOverdue(@Res() res: Response) {
    const csv = await this.borrowingService.exportLastMonthOverdue();
    res.send(csv);
  }
}
