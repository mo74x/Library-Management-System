import { IsInt, IsNotEmpty } from 'class-validator';

export class CheckoutBookDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsInt()
  @IsNotEmpty()
  borrowerId: number;
}
