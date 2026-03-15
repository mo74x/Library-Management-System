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

const prisma = new PrismaClient();

@Injectable()
export class BorrowingService {
  // A borrower can check out a book
  async checkout(checkoutBookDto: CheckoutBookDto) {
    const { bookId, borrowerId } = checkoutBookDto;

    // Set due date to 14 days from now [cite: 20]
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

      // 2. Check if borrower exists
      const borrower = await tx.borrower.findUnique({
        where: { id: borrowerId },
      });
      if (!borrower) throw new NotFoundException('Borrower not found');

      // 3. Decrement available quantity
      await tx.book.update({
        where: { id: bookId },
        data: { availableQuantity: { decrement: 1 } },
      });

      // 4. Create the borrow record to keep track of who checked it out [cite: 16, 17]
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

  // A borrower can return a book [cite: 18]
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

  // A borrower can check the books they currently have [cite: 19]
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

  // List books that are overdue [cite: 20]
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
}
