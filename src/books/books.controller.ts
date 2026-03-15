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
import { BasicAuthGuard } from '../common/guards/basic-auth.guard';
import { ApiTags, ApiOperation, ApiBasicAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Books')
@ApiBasicAuth()
@Controller('books')
@UseGuards(ThrottlerGuard, BasicAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Handles POST requests to add a new book to the library
  @ApiOperation({ summary: 'Add a new book' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // Fetches a paginated list of books, optionally filtering by a search term
  @ApiOperation({
    summary: 'List all books or search by query (title, author, ISBN)',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.booksService.findAll(
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // Retrieves details for a specific book using its ID
  @ApiOperation({ summary: 'Get a single book by ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // Updates the information of an existing book
  @ApiOperation({ summary: 'Update a book details' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  // Removes a book from the library's catalog
  @ApiOperation({ summary: 'Delete a book' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
