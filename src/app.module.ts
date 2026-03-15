import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { BorrowersModule } from './borrowers/borrowers.module';
import { BorrowingModule } from './borrowing/borrowing.module';

@Module({
  imports: [BooksModule, BorrowersModule, BorrowingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
