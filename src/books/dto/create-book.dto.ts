import { IsString, IsNotEmpty, IsInt, Min, IsISBN } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The author of the book',
    example: 'F. Scott Fitzgerald',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: 'The standard ISBN number (10 or 13 digits)',
    example: '9780743273565',
  })
  @IsISBN()
  isbn: string;

  @ApiProperty({
    description: 'Number of copies initially available',
    example: 5,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  availableQuantity: number;

  @ApiProperty({
    description: 'Physical location of the book in the library',
    example: 'Shelf A3, Section Fiction',
  })
  @IsString()
  @IsNotEmpty()
  shelfLocation: string;
}
