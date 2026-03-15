/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const prisma = new PrismaClient();

@Injectable()
export class BooksService {
  async create(createBookDto: CreateBookDto) {
    try {
      return await prisma.book.create({
        data: createBookDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  async findAll(searchQuery?: string) {
    if (searchQuery) {
      return prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { author: { contains: searchQuery, mode: 'insensitive' } },
            { isbn: { equals: searchQuery } },
          ],
        },
      });
    }
    return prisma.book.findMany();
  }

  async findOne(id: number) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    try {
      return await prisma.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A book with this ISBN already exists.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return prisma.book.delete({ where: { id } });
  }
}
