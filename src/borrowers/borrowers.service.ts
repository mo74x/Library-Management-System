/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';

const prisma = new PrismaClient();

@Injectable()
export class BorrowersService {
  async create(createBorrowerDto: CreateBorrowerDto) {
    try {
      return await prisma.borrower.create({
        data: createBorrowerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A borrower with this email already exists.',
        );
      }
      throw error;
    }
  }

  async findAll() {
    return prisma.borrower.findMany();
  }

  async findOne(id: number) {
    const borrower = await prisma.borrower.findUnique({ where: { id } });
    if (!borrower) {
      throw new NotFoundException(`Borrower with ID ${id} not found`);
    }
    return borrower;
  }

  async update(id: number, updateBorrowerDto: UpdateBorrowerDto) {
    await this.findOne(id);

    try {
      return await prisma.borrower.update({
        where: { id },
        data: updateBorrowerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'This email is already taken by another borrower.',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id); // Check if borrower exists
    return prisma.borrower.delete({ where: { id } });
  }
}
