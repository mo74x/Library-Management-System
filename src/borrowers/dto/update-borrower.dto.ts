import { PartialType } from '@nestjs/swagger';
import { CreateBorrowerDto } from './create-borrower.dto';

export class UpdateBorrowerDto extends PartialType(CreateBorrowerDto) {}
