# 📚 Bosta Library Management System

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

A robust RESTful API built to manage a modern library's core operations: Books, Borrowers, and the Borrowing workflow. Developed as a technical assessment for **Bosta**.

---

## 🚀 Key Features

*   **📖 Books Management**: Comprehensive CRUD operations featuring an advanced search endpoint (by title, author, or ISBN).
*   **👥 Borrower Management**: Smooth registration, profile updates, removal, and listing capabilities.
*   **🔄 Borrowing Process**: Streamlined checkout and return flows backed by strictly managed **Prisma Database Transactions** to ensure robust inventory integrity. Users can seamlessly check overdue statuses and access currently borrowed lists.
*   **📊 Analytical Reports (Bonus)**: One-click extraction of the previous month's operational data. Endpoints deliver pure `.csv` raw data for both general borrowing logs and overdue books.
*   **🛡️ Security & Scalability (Bonus)**: 
    *   **Rate Limiting**: Integrated `@nestjs/throttler` to block malicious abuse globally and endpoint-specifically.
    *   **Basic Authentication**: Protects the core Books API utilizing custom authentication guards.
    *   **Data Validation**: Strict input validation using Nest's powerful validation pipes to combat bad data payloads and SQL injections.

---

## 🗄️ Database Schema Representation

The core Postgres architecture relies heavily on relational mapping to easily track the flow of books between users.

| Model | Primary Fields | Unique / Key Roles | Relations |
| :--- | :--- | :--- | :--- |
| **`Book`** | `id`, `title`, `author`, `isbn`, `availableQuantity`, `shelfLocation` | `isbn` is unique. | `1:N` with Borrow records. |
| **`Borrower`** | `id`, `name`, `email`, `registeredDate` | `email` is unique. | `1:N` with Borrow records. |
| **`BorrowRecord`** | `id`, `bookId`, `borrowerId`, `checkoutDate`, `dueDate`, `returnDate`, `status` | `status` enum maps state. | Connects Book ↔ Borrower. |

---

## 🛠️ Quick Start Guide

You have two simple ways to get this project up and running locally.

### Method A: Docker Compose (Highly Recommended)

Simply utilize the full node+postgres environment built out in the provided Docker configuration.

```bash
docker-compose up --build
```
> The API immediately becomes available at `http://localhost:3000`.

### Method B: Manual Local Setup

If you prefer to run the Node API in your standard local environment instead of Docker:

**1. Install all dependencies:**
```bash
npm install --legacy-peer-deps
```

**2. Setup your local environment variables:**  
Create a `.env` file at the root tracking the following template:
```env
DATABASE_URL="postgresql://bosta_user:bosta_password@localhost:5432/bosta_library?schema=public"
API_USER=admin
API_PASS=bosta2026
```

**3. Launch the database (Optional Docker DB):**
```bash
docker-compose up db -d
```

**4. Sync your Prisma Schema to Postgres:**
```bash
npx prisma generate
npx prisma db push
```

**5. Launch it!**
```bash
npm run start:dev
```

---

## 🌐 API Documentation Reference

Testing the API is remarkably simple. Once the application is online, navigate to the auto-generated interactive Swagger UI:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

> **⚠️ Authentication Note:** The Books Module enforces Basic Authentication. To interact with it inside Swagger, click the **Authorize** lock button using:
> *   **Username:** `admin`
> *   **Password:** `bosta2026`

---

## 🧪 Testing Scope

A standard unit-testing suite validates module stability. To run the automated checks against the Borrowers service:
```bash
npm run test
```
