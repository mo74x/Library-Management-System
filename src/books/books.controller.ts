import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('books')
@UseGuards(ThrottlerGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Add a book
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // List all books OR Search for a book
  @Get()
  findAll(@Query('search') search?: string) {
    return this.booksService.findAll(search);
  }

  // Get a single book by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // Update a book's details
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  // Delete a book
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
