import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';

const prisma = new PrismaClient();

@Injectable()
export class BorrowersService {
  // Registers a new borrower, ensuring their email is unique
  async create(createBorrowerDto: CreateBorrowerDto) {
    try {
      return await prisma.borrower.create({
        data: createBorrowerDto,
      });
    } catch (error) {
      // P2002 indicates a unique constraint violation (likely the email)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A borrower with this email already exists.',
        );
      }
      throw error;
    }
  }

  // Retrieves a paginated list of all borrowers
  async findAll(page = 1, limit = 10) {
    // Calculate how many records to skip based on the current page
    const skip = (page - 1) * limit;

    // Fetch both the data list and total count concurrently for better performance
    const [data, total] = await Promise.all([
      prisma.borrower.findMany({ skip, take: limit }),
      prisma.borrower.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Retrieves a specific borrower by their ID, throwing an error if not found
  async findOne(id: number) {
    const borrower = await prisma.borrower.findUnique({ where: { id } });
    if (!borrower) {
      throw new NotFoundException(`Borrower with ID ${id} not found`);
    }
    return borrower;
  }

  // Updates a borrower's details
  async update(id: number, updateBorrowerDto: UpdateBorrowerDto) {
    // Verify the borrower actually exists before updating
    await this.findOne(id);

    try {
      return await prisma.borrower.update({
        where: { id },
        data: updateBorrowerDto,
      });
    } catch (error) {
      // Catch unique constraint errors if the new email is already in use
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This email is already taken by another borrower.',
        );
      }
      throw error;
    }
  }

  // Deletes a borrower from the system
  async remove(id: number) {
    // Ensure the borrower exists before trying to delete
    await this.findOne(id);

    // Prevent deletion if the borrower still has unreturned books
    const activeBorrow = await prisma.borrowRecord.findFirst({
      where: {
        borrowerId: id,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    if (activeBorrow) {
      throw new BadRequestException(
        'Cannot delete this borrower because they have unreturned books.',
      );
    }

    return prisma.borrower.delete({ where: { id } });
  }
}
