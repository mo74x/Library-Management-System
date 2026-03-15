/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Query,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

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

  @ApiOperation({
    summary: 'Export borrowing data to CSV (defaults to last month)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO 8601 format (e.g. 2024-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO 8601 format (e.g. 2024-12-31)',
  })
  @Get('export/borrows')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=borrows-export.csv')
  async exportBorrows(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.borrowingService.exportBorrowsData(
      startDate,
      endDate,
    );
    res.send(csv);
  }

  @ApiOperation({
    summary: 'Export overdue borrows to CSV (defaults to last month)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO 8601 format (e.g. 2024-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO 8601 format (e.g. 2024-12-31)',
  })
  @Get('export/overdue')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=overdue-export.csv')
  async exportOverdue(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.borrowingService.exportOverdueData(
      startDate,
      endDate,
    );
    res.send(csv);
  }

  @ApiOperation({
    summary: 'Export borrowing data to Excel (.xlsx) (defaults to last month)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO 8601 format (e.g. 2024-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO 8601 format (e.g. 2024-12-31)',
  })
  @Get('export/borrows/xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=borrows-export.xlsx')
  async exportBorrowsXlsx(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer: Buffer = await this.borrowingService.exportBorrowsXlsx(
      startDate,
      endDate,
    );
    res.send(buffer);
  }

  @ApiOperation({
    summary: 'Export overdue borrows to Excel (.xlsx) (defaults to last month)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO 8601 format (e.g. 2024-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO 8601 format (e.g. 2024-12-31)',
  })
  @Get('export/overdue/xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=overdue-export.xlsx')
  async exportOverdueXlsx(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer: Buffer = await this.borrowingService.exportOverdueXlsx(
      startDate,
      endDate,
    );
    res.send(buffer);
  }
}
