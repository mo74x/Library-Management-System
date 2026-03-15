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

  // Handles the process of checking out a book to a borrower
  @ApiOperation({ summary: 'Checkout a book for a borrower' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('checkout')
  checkout(@Body() checkoutBookDto: CheckoutBookDto) {
    return this.borrowingService.checkout(checkoutBookDto);
  }

  // Processes a returned book and updates its borrowing record
  @ApiOperation({ summary: 'Return a borrowed book' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('return/:recordId')
  returnBook(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.borrowingService.returnBook(recordId);
  }

  // Retrieves all active and overdue borrowing records for a specific borrower
  @ApiOperation({
    summary: 'List current books borrowed by a specific borrower',
  })
  @Get('borrower/:borrowerId')
  findCurrentByBorrower(@Param('borrowerId', ParseIntPipe) borrowerId: number) {
    return this.borrowingService.findCurrentByBorrower(borrowerId);
  }

  // Lists all books that are currently overdue across the library
  @ApiOperation({ summary: 'List books that are overdue' })
  @Get('overdue')
  findOverdueBooks() {
    return this.borrowingService.findOverdueBooks();
  }

  // Generates and downloads a CSV report of borrowing activity over a date range
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

  // Generates and downloads a CSV report specifically for overdue books
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

  // Generates and downloads an Excel (.xlsx) report of borrowing activity
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer: Buffer = await this.borrowingService.exportBorrowsXlsx(
      startDate,
      endDate,
    );
    res.send(buffer);
  }

  // Generates and downloads an Excel (.xlsx) report specifically for overdue books
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer: Buffer = await this.borrowingService.exportOverdueXlsx(
      startDate,
      endDate,
    );
    res.send(buffer);
  }
}
