# Personal Finance Manager - Technical Requirements

## Project Overview

Build a personal financial management web application to track income and expenses with detailed categorization and dashboard analytics.

## Technology Stack

### Core Framework

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite
- **ORM**: Prisma (with SQLite provider)
- **Testing**: Playwright for E2E tests
- **Package manager**: Use pnpm for package manager, my machine already have pnpm so you don't need to install again

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@prisma/client": "^5.7.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.0.0",
    "lucide-react": "latest",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "prisma": "^5.7.0",
    "typescript": "^5.0.0"
  }
}
```

## Database Schema (Prisma)

### Prisma Schema File (prisma/schema.prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Transaction {
  id          Int      @id @default(autoincrement())
  type        String   // 'income' or 'expense'
  amount      Float
  category    String
  description String?
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@index([type])
  @@index([category])
  @@map("transactions")
}
```

### Prisma Setup Commands

```bash
# Initialize Prisma
npx prisma init --datasource-provider sqlite

# Generate Prisma Client
npx prisma generate

# Create database and tables
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Predefined Categories

**Income Categories:**

- Salary
- Freelance
- Investment
- Gift
- Other Income

**Expense Categories:**

- Shopee Spend
- Badminton
- Tech Stuff
- Rackets
- Food & Dining
- Transportation
- Bills & Utilities
- Entertainment
- Healthcare
- Other Expenses

## Application Structure

### Directory Structure

```
src/
├── app/
│   ├── page.tsx                 # Dashboard (main page)
│   ├── transactions/
│   │   ├── page.tsx            # Transaction list
│   │   └── add/page.tsx        # Add transaction form
│   ├── api/
│   │   └── transactions/
│   │       ├── route.ts        # GET (list), POST (create)
│   │       ├── [id]/route.ts   # GET, PUT, DELETE by ID
│   │       └── stats/route.ts  # GET statistics
│   └── layout.tsx
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── db.ts                   # Database query functions
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions
├── components/
│   ├── ui/                     # shadcn components
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── TrendChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionList.tsx
│   └── Navigation.tsx
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # (Optional) Seed data
└── tests/
    ├── dashboard.spec.ts
    ├── transactions.spec.ts
    └── api.spec.ts
```

## Prisma Client Setup

### Prisma Client Singleton (lib/prisma.ts)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**IMPORTANT**: Always import prisma from this file, never create new PrismaClient instances

## Core Features & Requirements

### 1. Dashboard Page (/)

**Must Display:**

- **Summary Cards** (top row, 4 cards):

  - Total Income (current month)
  - Total Expenses (current month)
  - Net Balance (Income - Expenses)
  - Transaction Count (current month)

- **Visualizations**:

  - **Category Breakdown Chart**: Pie/Donut chart showing expense distribution by category
  - **Income vs Expense Trend**: Line chart showing daily/weekly trends for current month
  - **Top Categories**: Bar chart of top 5 expense categories

- **Recent Transactions Table**:
  - Show last 10 transactions
  - Display: Date, Type, Category, Description, Amount
  - Action buttons: View, Edit, Delete

**Dashboard Requirements:**

- All statistics default to current month
- Include month selector to view historical data
- Real-time updates when transactions are added/modified
- Responsive grid layout (mobile: 1 column, tablet: 2 columns, desktop: 4 columns)

### 2. Transaction Management

#### ✅ Add Transaction Form (/transactions/add)

**Required Fields:** (Implemented)

- Type: Radio buttons (Income / Expense)
- Amount: Number input (positive only, 2 decimal places)
- Category: Select dropdown (filtered by type)
- Description: Text input (optional, max 200 chars)
- Date: Date picker (default: today)

**Form Validation:** (Implemented)

- Amount must be greater than 0
- Category must be selected
- Date cannot be in the future
- Show inline error messages
- Disable submit until valid

**Form Behavior:** (Implemented)

- Clear form after successful submission
- Show success toast notification
- Redirect to dashboard or stay on page (user preference)

#### Transaction List (/transactions)

**Features:**

- Paginated table (20 items per page)
- Filter by:
  - Type (All / Income / Expense)
  - Category (dropdown with all categories)
  - Date range (start date, end date)
- Sort by: Date, Amount, Category (ascending/descending)
- Search by description (debounced)
- Bulk actions: Delete selected transactions

**Table Columns:**

- Date (formatted: MMM DD, YYYY)
- Type (badge: green for income, red for expense)
- Category (text)
- Description (truncated if long)
- Amount (formatted: $X,XXX.XX)
- Actions (Edit, Delete icons)

#### Edit Transaction

- Modal or inline editing
- Same validation as Add form
- Show "Last updated" timestamp
- Confirm before saving changes

#### Delete Transaction

- Confirmation modal with transaction details
- Cannot be undone warning
- Update dashboard immediately after deletion

### 3. API Routes

#### GET /api/transactions

**Query Parameters:**

- `type`: 'income' | 'expense' | 'all' (default: 'all')
- `category`: string (optional)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `sortBy`: 'date' | 'amount' | 'category' (default: 'date')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:**

```typescript
{
  transactions: Transaction[],
  total: number,
  page: number,
  totalPages: number
}
```

**Prisma Query Example:**

```typescript
const transactions = await prisma.transaction.findMany({
  where: {
    type: type !== "all" ? type : undefined,
    category: category || undefined,
    date: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  },
  orderBy: { [sortBy]: sortOrder },
  skip: (page - 1) * limit,
  take: limit,
});
```

#### POST /api/transactions

**Request Body:**

```typescript
{
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description?: string,
  date: string // ISO format
}
```

**Response:**

```typescript
{
  success: boolean,
  transaction: Transaction
}
```

**Prisma Query Example:**

```typescript
const transaction = await prisma.transaction.create({
  data: {
    type,
    amount,
    category,
    description,
    date: new Date(date),
  },
});
```

#### GET /api/transactions/[id]

**Response:** Single transaction object

**Prisma Query Example:**

```typescript
const transaction = await prisma.transaction.findUnique({
  where: { id: Number(id) },
});
```

#### PUT /api/transactions/[id]

**Request Body:** Same as POST
**Response:** Updated transaction object

**Prisma Query Example:**

```typescript
const transaction = await prisma.transaction.update({
  where: { id: Number(id) },
  data: {
    type,
    amount,
    category,
    description,
    date: new Date(date),
  },
});
```

#### DELETE /api/transactions/[id]

**Response:**

```typescript
{
  success: boolean,
  message: string
}
```

**Prisma Query Example:**

```typescript
await prisma.transaction.delete({
  where: { id: Number(id) },
});
```

#### GET /api/transactions/stats

**Query Parameters:**

- `month`: YYYY-MM (default: current month)

**Response:**

```typescript
{
  totalIncome: number,
  totalExpenses: number,
  netBalance: number,
  transactionCount: number,
  categoryBreakdown: { category: string, total: number }[],
  dailyTrend: { date: string, income: number, expense: number }[]
}
```

**Prisma Query Example:**

```typescript
// Get month range
const startDate = new Date(`${month}-01`);
const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

// Total income
const totalIncome = await prisma.transaction.aggregate({
  where: {
    type: "income",
    date: { gte: startDate, lte: endDate },
  },
  _sum: { amount: true },
});

// Total expenses
const totalExpenses = await prisma.transaction.aggregate({
  where: {
    type: "expense",
    date: { gte: startDate, lte: endDate },
  },
  _sum: { amount: true },
});

// Category breakdown
const categoryBreakdown = await prisma.transaction.groupBy({
  by: ["category"],
  where: {
    type: "expense",
    date: { gte: startDate, lte: endDate },
  },
  _sum: { amount: true },
});
```

## TypeScript Interfaces

```typescript
// lib/types.ts
import { Transaction as PrismaTransaction } from "@prisma/client";

export type Transaction = PrismaTransaction;

export interface TransactionInput {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export interface CategoryStat {
  category: string;
  total: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  income: number;
  expense: number;
}

export interface TransactionFilters {
  type?: "income" | "expense" | "all";
  category?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "category";
  sortOrder?: "asc" | "desc";
}
```

## Database Functions (lib/db.ts)

**Required Functions Using Prisma:**

```typescript
import { prisma } from "./prisma";
import {
  TransactionInput,
  TransactionFilters,
  DashboardStats,
  CategoryStat,
  DailyTrend,
} from "./types";

// Transaction CRUD
export async function createTransaction(input: TransactionInput) {
  return await prisma.transaction.create({
    data: {
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: new Date(input.date),
    },
  });
}

export async function getTransactionById(id: number) {
  return await prisma.transaction.findUnique({
    where: { id },
  });
}

export async function updateTransaction(id: number, input: TransactionInput) {
  return await prisma.transaction.update({
    where: { id },
    data: {
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: new Date(input.date),
    },
  });
}

export async function deleteTransaction(id: number) {
  await prisma.transaction.delete({
    where: { id },
  });
  return true;
}

// Queries with Prisma
export async function getTransactions(filters: TransactionFilters) {
  const {
    type = "all",
    category,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const where = {
    type: type !== "all" ? type : undefined,
    category: category || undefined,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export async function getDashboardStats(
  month: string
): Promise<DashboardStats> {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  const [incomeData, expenseData, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "income", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "expense", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: { date: { gte: startDate, lte: endDate } },
    }),
  ]);

  const totalIncome = incomeData._sum.amount || 0;
  const totalExpenses = expenseData._sum.amount || 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: count,
  };
}

export async function getCategoryBreakdown(
  month: string,
  type: "income" | "expense"
): Promise<CategoryStat[]> {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  const breakdown = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      type,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const total = breakdown.reduce(
    (sum, item) => sum + (item._sum.amount || 0),
    0
  );

  return breakdown.map((item) => ({
    category: item.category,
    total: item._sum.amount || 0,
    percentage: total > 0 ? ((item._sum.amount || 0) / total) * 100 : 0,
  }));
}

export async function getDailyTrend(month: string): Promise<DailyTrend[]> {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Group by date
  const dailyMap = new Map<string, { income: number; expense: number }>();

  transactions.forEach((t) => {
    const dateKey = t.date.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) || { income: 0, expense: 0 };

    if (t.type === "income") {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount;
    }

    dailyMap.set(dateKey, existing);
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    income: data.income,
    expense: data.expense,
  }));
}
```

## UI/UX Requirements

### General

- Dark mode support (respect system preference)
- Responsive design (mobile-first)
- Loading states for all async operations
- Error boundaries for graceful error handling
- Toast notifications for user actions
- Accessible (WCAG 2.1 AA)

### Color Scheme

- Income: Green shades (#10b981)
- Expenses: Red shades (#ef4444)
- Neutral: Zinc/Slate grays
- Use Tailwind's built-in color palette

### Components to Use from shadcn/ui

- Button
- Card
- Input
- Label
- Select
- Table
- Dialog (Modal)
- Toast
- Calendar (Date Picker)
- Badge
- Tabs
- Dropdown Menu

### Charts (using Recharts)

- Pie Chart for category breakdown
- Line Chart for income/expense trends
- Bar Chart for top categories

## Testing Requirements (Playwright)

### Test Coverage

#### 1. Dashboard Tests (tests/dashboard.spec.ts)

```typescript
- Load dashboard page successfully
- Display correct total income for current month
- Display correct total expenses for current month
- Calculate net balance correctly
- Show recent transactions (max 10)
- Category chart renders with data
- Trend chart renders with data
- Navigate to add transaction form
- Filter by different months
```

#### 2. Transaction Tests (tests/transactions.spec.ts)

```typescript
// Add Transaction
- Open add transaction form
- Fill form with valid income data
- Submit form successfully
- Verify success toast appears
- Verify transaction appears in list

- Fill form with valid expense data
- Submit and verify

- Test form validation (empty amount, invalid date, etc.)
- Verify error messages display correctly

// List Transactions
- Load transaction list page
- Verify table displays transactions
- Test pagination (next/previous pages)
- Filter by type (income/expense)
- Filter by category
- Filter by date range
- Search by description
- Sort by date ascending/descending
- Sort by amount ascending/descending

// Edit Transaction
- Click edit button on transaction
- Modify amount and category
- Save changes
- Verify updated values in list

// Delete Transaction
- Click delete button
- Confirm deletion in modal
- Verify transaction removed from list
- Verify dashboard stats updated
```

#### 3. API Tests (tests/api.spec.ts)

```typescript
- POST /api/transactions with valid data returns 200
- POST with invalid data returns 400
- GET /api/transactions returns paginated results
- GET /api/transactions with filters works correctly
- PUT /api/transactions/[id] updates transaction
- DELETE /api/transactions/[id] removes transaction
- GET /api/transactions/stats returns correct calculations
```

### Test Database Setup

```typescript
// Before tests, seed test database
beforeAll(async () => {
  await prisma.transaction.deleteMany();
  // Seed with test data
});

// After tests, cleanup
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Test Configuration (playwright.config.ts)

```typescript
- Base URL: http://localhost:3000
- Browsers: Chromium, Firefox, WebKit
- Screenshots on failure
- Video on first retry
- Parallel execution
```

## Development Guidelines

### Prisma Best Practices

- **Always use the singleton client** from `lib/prisma.ts`
- **Use Prisma's type generation** - run `npx prisma generate` after schema changes
- **Use transactions** for operations that must succeed/fail together
- **Leverage Prisma's query optimization** - use `select` and `include` appropriately
- **Handle Prisma errors** properly (PrismaClientKnownRequestError, etc.)

### Code Quality

- Use ESLint with Next.js recommended config
- Use Prettier for code formatting
- Use TypeScript strict mode
- No `any` types (use `unknown` if necessary)
- Implement proper error handling (try-catch blocks)
- Log errors to console in development

### Performance

- Use React Server Components where possible
- Implement proper loading states
- Optimize Prisma queries (use `select` to fetch only needed fields)
- Lazy load charts
- Debounce search inputs (300ms)
- Use Prisma's connection pooling efficiently

### Security

- Validate all user inputs on server side
- Use Prisma's parameterized queries (built-in SQL injection prevention)
- Sanitize user input for XSS prevention
- Implement rate limiting on API routes (optional)

### Git Workflow

- Initialize with `.gitignore` (exclude node_modules, .env, database file)
- Meaningful commit messages
- Database file (`prisma/dev.db`) should be in `.gitignore`
- Include `prisma/schema.prisma` in version control

## Prisma-Specific Implementation Notes

### Environment Variables (.env)

```bash
DATABASE_URL="file:./dev.db"
```

### Migration vs Push

- **Development**: Use `npx prisma db push` for rapid prototyping
- **Production**: Use `npx prisma migrate dev` for versioned migrations

### Prisma Studio

```bash
npx prisma studio
# Opens GUI at http://localhost:5555 to view/edit data
```

### Seeding (Optional - prisma/seed.ts)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.createMany({
    data: [
      {
        type: "income",
        amount: 5000,
        category: "Salary",
        description: "Monthly salary",
        date: new Date(),
      },
      // Add more seed data...
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Implementation Checklist

**Phase 1: Setup & Database**

- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Install Prisma and initialize with SQLite
- [ ] Create Prisma schema
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Create Prisma client singleton
- [ ] Create database query functions
- [ ] Create TypeScript interfaces

**Phase 2: API Routes**

- [ ] Implement GET /api/transactions (with Prisma)
- [ ] Implement POST /api/transactions
- [ ] Implement GET /api/transactions/[id]
- [ ] Implement PUT /api/transactions/[id]
- [ ] Implement DELETE /api/transactions/[id]
- [ ] Implement GET /api/transactions/stats
- [ ] Add input validation and error handling
- [ ] Test all endpoints with sample data

**Phase 3: UI Components**

- [ ] Create Navigation component
- [ ] Create StatCard component
- [ ] Create CategoryChart component
- [ ] Create TrendChart component
- [ ] Create RecentTransactions component
- [ ] Create TransactionForm component
- [ ] Create TransactionList component

**Phase 4: Pages**

- [ ] Build Dashboard page (/)
- [ ] Build Add Transaction page (/transactions/add)
- [ ] Build Transaction List page (/transactions)
- [ ] Implement edit functionality
- [ ] Implement delete functionality
- [ ] Add loading and error states

**Phase 5: Testing**

- [ ] Set up Playwright
- [ ] Set up test database cleanup
- [ ] Write dashboard tests
- [ ] Write transaction CRUD tests
- [ ] Write API tests
- [ ] Verify all tests pass

**Phase 6: Polish**

- [ ] Add dark mode support
- [ ] Improve mobile responsiveness
- [ ] Add toast notifications
- [ ] Implement accessibility features
- [ ] Performance optimization
- [ ] Final testing and bug fixes

## Success Criteria

The application is complete when:

1. All CRUD operations work correctly with Prisma
2. Dashboard displays accurate statistics
3. Charts render properly with real data
4. All forms have proper validation
5. Responsive on mobile, tablet, and desktop
6. All Playwright tests pass
7. No TypeScript errors
8. No console errors or warnings
9. Prisma queries are optimized
10. Database persists data correctly
11. Code is clean, typed, and well-organized

## Notes for AI Agent

- **DO NOT** skip implementation details
- **DO NOT** use placeholder comments like "// TODO: implement this"
- **DO NOT** hallucinate libraries that aren't in the tech stack
- **DO NOT** create multiple PrismaClient instances - always use the singleton
- **ALWAYS** implement complete, working code
- **ALWAYS** follow TypeScript best practices
- **ALWAYS** handle errors properly (especially Prisma errors)
- **ALWAYS** validate user input
- **ALWAYS** run `npx prisma generate` after schema changes
- **ALWAYS** use Prisma's type-safe queries
- **TEST** each feature as you build it
- If stuck, refer back to this requirements document
- Database file location: `prisma/dev.db`
- Use Prisma's async/await API consistently
- Follow Next.js App Router conventions
- Use "use client" directive only when necessary (forms, interactivity)
- Leverage Prisma's built-in type safety - use generated types from `@prisma/client`
