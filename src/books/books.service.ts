import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const prisma = new PrismaClient();

@Injectable()
export class BooksService {
  // Adds a new book to the database, ensuring the ISBN is unique
  async create(createBookDto: CreateBookDto) {
    try {
      return await prisma.book.create({
        data: createBookDto,
      });
    } catch (error) {
      // P2002 indicates a unique constraint violation (like the ISBN)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  // Retrieves books with optional search filtering and pagination
  async findAll(searchQuery?: string, page = 1, limit = 10) {
    // Calculate how many records to skip based on the current page
    const skip = (page - 1) * limit;
    // Build a search filter if a query is provided
    // Build a search filter if a query is provided
    const where = searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' as const } },
            {
              author: { contains: searchQuery, mode: 'insensitive' as const },
            },
            { isbn: { equals: searchQuery } },
          ],
        }
      : {};

    // Fetch both the filtered data and total count concurrently
    const [data, total] = await Promise.all([
      prisma.book.findMany({ where, skip, take: limit }),
      prisma.book.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Finds a specific book by ID, throwing an error if it doesn't exist
  async findOne(id: number) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  // Modifies an existing book's details while checking for ISBN conflicts
  async update(id: number, updateBookDto: UpdateBookDto) {
    // Verify the book actually exists before updating
    await this.findOne(id);

    try {
      return await prisma.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      // Catch unique constraint errors if the new ISBN is already in use
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  // Deletes a book, but only if it's not currently borrowed by anyone
  async remove(id: number) {
    // Ensure the book exists before trying to delete
    await this.findOne(id);

    // Prevent deletion if the book is currently checked out to avoid breaking records
    const activeBorrow = await prisma.borrowRecord.findFirst({
      where: {
        bookId: id,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    if (activeBorrow) {
      throw new BadRequestException(
        'Cannot delete this book because it is currently checked out.',
      );
    }

    return prisma.book.delete({ where: { id } });
  }
}
