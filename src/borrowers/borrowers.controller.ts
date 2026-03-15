import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('borrowers')
@UseGuards(ThrottlerGuard)
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  // Register a new borrower
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  // List all borrowers
  @Get()
  findAll() {
    return this.borrowersService.findAll();
  }

  // Get a single borrower
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.borrowersService.findOne(id);
  }

  // Update a borrower's details
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  // Delete a borrower
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.borrowersService.remove(id);
  }
}
