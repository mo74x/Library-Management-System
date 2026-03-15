import { IsString, IsNotEmpty, IsInt, Min, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsISBN()
  isbn: string;

  @IsInt()
  @Min(0)
  availableQuantity: number;

  @IsString()
  @IsNotEmpty()
  shelfLocation: string;
}
