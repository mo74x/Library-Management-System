import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Borrowers')
@Controller('borrowers')
@UseGuards(ThrottlerGuard)
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @ApiOperation({ summary: 'Register a new borrower' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  @ApiOperation({ summary: 'List all borrowers' })
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
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.borrowersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @ApiOperation({ summary: 'Get a single borrower by ID' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.borrowersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a borrower details' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  @ApiOperation({ summary: 'Delete a borrower' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.borrowersService.remove(id);
  }
}
