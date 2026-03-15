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

  @ApiOperation({ summary: 'Add a new book' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @ApiOperation({
    summary: 'List all books or search by query (title, author, ISBN)',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  findAll(@Query('search') search?: string) {
    return this.booksService.findAll(search);
  }

  @ApiOperation({ summary: 'Get a single book by ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a book details' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @ApiOperation({ summary: 'Delete a book' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
