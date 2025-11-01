"use client";

import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, TransactionStatsResponse } from "@/lib/types";
import {
  Calculator,
  DollarSign,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStatsResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const startOfMonth = new Date(`${selectedMonth}-01`);
      const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const [statsRes, transactionsRes] = await Promise.all([
        fetch(
          `/api/transactions/stats?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
        ),
        fetch("/api/transactions?limit=10&sortBy=date&sortOrder=desc"),
      ]);

      if (!statsRes.ok || !transactionsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [statsData, transactionsData] = await Promise.all([
        statsRes.json(),
        transactionsRes.json(),
      ]);

      setStats(statsData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Generate month options (last 12 months)
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your financial activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(`${month}-01`).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/transactions/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={stats?.totals.totalIncome ?? 0}
          variant="income"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Total Expenses"
          value={stats?.totals.totalExpenses ?? 0}
          variant="expense"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          title="Net Balance"
          value={stats?.totals.net ?? 0}
          variant={stats && stats.totals.net >= 0 ? "income" : "expense"}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Transactions"
          value={stats?.totals.transactionCount ?? 0}
          variant="neutral"
          icon={<Calculator className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          data={stats?.byCategory ?? []}
          title="Expense Breakdown by Category"
        />
        <TrendChart data={stats?.trend ?? []} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        onDelete={() => fetchDashboardData()}
      />
    </div>
  );
}
