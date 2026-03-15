# Bosta Library Management System

A RESTful API built with **NestJS**, **Prisma**, and **PostgreSQL** that implements a library management system for managing books, borrowers, and the borrowing process.

## 🚀 Features

- **Books Management**: Full CRUD operations with search functionality.
- **Borrower Management**: Register, update, delete, and list borrowers.
- **Borrowing Process**: Checkout books, return books, check overdue status, and list currently borrowed books.
- **Security & Best Practices**: 
  - Basic Authentication protects sensitive endpoints (Books API globally).
  - Rate limiting protects endpoints from abuse (using `@nestjs/throttler`).
  - Strict input validation prevents bad data and SQL Injection scenarios.
- **Reporting**: Export last month's borrows or overdue books directly to CSV.

## 🗄️ Database Schema

The database uses PostgreSQL via Prisma. Here is the structure:

- **Book**: `id` (PK) | `title` | `author` | `isbn` (Unique) | `availableQuantity` | `shelfLocation` | `createdAt` | `updatedAt`
- **Borrower**: `id` (PK) | `name` | `email` (Unique) | `registeredDate` | `createdAt` | `updatedAt`
- **BorrowRecord**: `id` (PK) | `bookId` (FK) | `borrowerId` (FK) | `checkoutDate` | `dueDate` | `returnDate` | `status` (BORROWED, RETURNED, OVERDUE)

Relations:
- A `Book` can have many `BorrowRecords` (1:N)
- A `Borrower` can have many `BorrowRecords` (1:N)

## 🛠️ Setup & Run Instructions

### 1. Using Docker (Recommended)

You can launch both the PostgreSQL database and the API using Docker Compose.

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000`.

### 2. Running Locally

If you prefer to run the application locally without the API Docker container:

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the database** (Optional: you can just run the DB via docker)
   ```bash
   docker-compose up db -d
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://bosta_user:bosta_password@localhost:5432/bosta_library?schema=public"
   API_USER=admin
   API_PASS=bosta2026
   ```

4. **Sync Database Schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *Note: Using `db push` is fine for development layout. For production migrations use `npx prisma migrate deploy`.*

5. **Start the application**
   ```bash
   npm run start:dev
   ```

## 📚 API Documentation

Once the application is running, the interactive Swagger API documentation is available at:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

From there, you can view all endpoints, expected inputs/outputs, and test the API directly from your browser.

*Note: The Books API requires Basic Authentication. Click the "Authorize" button in Swagger and use the credentials below:*
- **Username**: `admin`
- **Password**: `bosta2026`

## 🧪 Running Tests

To run the unit tests (which cover the Borrowers Service):
```bash
npm run test
```
