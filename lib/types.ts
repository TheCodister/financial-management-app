import type { Prisma } from "@prisma/client";

// Re-export Transaction type from Prisma
export type Transaction = Prisma.TransactionGetPayload<{ select: null }>;

// Type for transaction creation/update
export type TransactionFormData = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>;

// API response types
export type TransactionListResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
};

export type TransactionStatsResponse = {
  totals: {
    totalIncome: number;
    totalExpenses: number;
    net: number;
    transactionCount: number;
  };
  byCategory: {
    category: string;
    _sum: { amount: number };
  }[];
  trend: {
    date: string;
    income: number;
    expense: number;
  }[];
  start: string;
  end: string;
};

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Shopee Spend",
  "Badminton",
  "Tech Stuff",
  "Rackets",
  "Food & Dining",
  "Transportation",
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Other Expenses",
] as const;

export type TransactionType = "income" | "expense";
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

// Form validation types
export type ValidationError = {
  type?: string;
  amount?: string;
  category?: string;
  date?: string;
  description?: string;
};

// API query parameters
export type TransactionQueryParams = {
  type?: TransactionType | "all";
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "category";
  sortOrder?: "asc" | "desc";
};
