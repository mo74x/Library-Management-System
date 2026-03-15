/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

@Injectable()
export class BorrowingService {
  // A borrower can check out a book
  async checkout(checkoutBookDto: CheckoutBookDto) {
    const { bookId, borrowerId } = checkoutBookDto;

    // Set due date to 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Use a transaction to ensure data integrity
    return prisma.$transaction(async (tx) => {
      // 1. Check if book exists and has available quantity
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new NotFoundException('Book not found');
      if (book.availableQuantity <= 0) {
        throw new BadRequestException('This book is currently out of stock');
      }

      // Check if borrower exists
      const borrower = await tx.borrower.findUnique({
        where: { id: borrowerId },
      });
      if (!borrower) throw new NotFoundException('Borrower not found');

      // Decrement available quantity
      await tx.book.update({
        where: { id: bookId },
        data: { availableQuantity: { decrement: 1 } },
      });

      //the borrow record to keep track of who checked it out
      return tx.borrowRecord.create({
        data: {
          bookId,
          borrowerId,
          dueDate,
          status: 'BORROWED',
        },
      });
    });
  }

  // A borrower can return a book
  async returnBook(recordId: number) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.borrowRecord.findUnique({
        where: { id: recordId },
      });

      if (!record) throw new NotFoundException('Borrow record not found');
      if (record.status === 'RETURNED') {
        throw new BadRequestException('This book has already been returned');
      }

      // 1. Mark record as returned
      const updatedRecord = await tx.borrowRecord.update({
        where: { id: recordId },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      });

      // 2. Increment book quantity
      await tx.book.update({
        where: { id: record.bookId },
        data: { availableQuantity: { increment: 1 } },
      });

      return updatedRecord;
    });
  }

  // A borrower can check the books they currently have
  async findCurrentByBorrower(borrowerId: number) {
    return prisma.borrowRecord.findMany({
      where: {
        borrowerId,
        status: {
          in: ['BORROWED', 'OVERDUE'],
        },
      },
      include: {
        book: true, // Include book details in the response
      },
    });
  }

  // List books that are overdue
  async findOverdueBooks() {
    return prisma.borrowRecord.findMany({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: new Date(), // Due date is less than the current date
        },
      },
      include: {
        book: true,
        borrower: true,
      },
    });
  }

  // Helper to resolve start/end date range
  private resolveDateRange(startDate?: string, endDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() - 1);
          return d;
        })();
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (e.g. 2024-01-01).',
      );
    }

    return { start, end };
  }

  // Export borrows for a specific period (defaults to last month)
  async exportBorrowsData(startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    const records = await prisma.borrowRecord.findMany({
      where: {
        checkoutDate: { gte: start, lte: end },
      },
      include: { book: true, borrower: true },
    });

    const formattedData = records.map((record) => ({
      RecordID: record.id,
      BookTitle: record.book.title,
      BorrowerName: record.borrower.name,
      BorrowerEmail: record.borrower.email,
      CheckoutDate: record.checkoutDate,
      DueDate: record.dueDate,
      ReturnDate: record.returnDate || 'Not Returned',
      Status: record.status,
    }));

    return parse(formattedData);
  }

  // Export overdue borrows for a specific period (defaults to last month)
  async exportOverdueData(startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    const records = await prisma.borrowRecord.findMany({
      where: {
        checkoutDate: { gte: start, lte: end },
        status: 'BORROWED',
        dueDate: { lt: new Date() },
      },
      include: { book: true, borrower: true },
    });

    const formattedData = records.map((record) => ({
      RecordID: record.id,
      BookTitle: record.book.title,
      BorrowerName: record.borrower.name,
      DueDate: record.dueDate,
      DaysOverdue: Math.floor(
        (new Date().getTime() - record.dueDate.getTime()) / (1000 * 3600 * 24),
      ),
    }));

    return parse(formattedData);
  }

  // Export borrows as Excel (.xlsx)
  async exportBorrowsXlsx(startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    const records = await prisma.borrowRecord.findMany({
      where: {
        checkoutDate: { gte: start, lte: end },
      },
      include: { book: true, borrower: true },
    });

    const formattedData = records.map((record) => ({
      RecordID: record.id,
      BookTitle: record.book.title,
      BorrowerName: record.borrower.name,
      BorrowerEmail: record.borrower.email,
      CheckoutDate: record.checkoutDate.toISOString(),
      DueDate: record.dueDate.toISOString(),
      ReturnDate: record.returnDate
        ? record.returnDate.toISOString()
        : 'Not Returned',
      Status: record.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrows');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Export overdue borrows as Excel (.xlsx)
  async exportOverdueXlsx(startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    const records = await prisma.borrowRecord.findMany({
      where: {
        checkoutDate: { gte: start, lte: end },
        status: 'BORROWED',
        dueDate: { lt: new Date() },
      },
      include: { book: true, borrower: true },
    });

    const formattedData = records.map((record) => ({
      RecordID: record.id,
      BookTitle: record.book.title,
      BorrowerName: record.borrower.name,
      DueDate: record.dueDate.toISOString(),
      DaysOverdue: Math.floor(
        (new Date().getTime() - record.dueDate.getTime()) / (1000 * 3600 * 24),
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Overdue');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
