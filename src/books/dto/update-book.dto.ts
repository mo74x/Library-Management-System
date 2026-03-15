import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateBookDto extends PartialType(CreateBookDto) {}
