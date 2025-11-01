import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date) {
  return format(date, "MMM dd, yyyy");
}

export function getTransactionColor(type: "income" | "expense") {
  return type === "income"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
}

export function validateAmount(amount: string) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "Amount must be a valid number";
  if (num <= 0) return "Amount must be greater than 0";
  return "";
}

export function validateDate(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  if (d > new Date()) return "Date cannot be in the future";
  return "";
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
