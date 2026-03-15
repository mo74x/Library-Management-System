import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutBookDto {
  @ApiProperty({
    description: 'The numeric ID of the book to checkout',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @ApiProperty({
    description: 'The numeric ID of the borrower checking out the book',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  borrowerId: number;
}
