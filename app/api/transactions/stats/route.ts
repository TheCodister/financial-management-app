import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams;
    const startParam = q.get("startDate");
    const endParam = q.get("endDate");

    let start: Date;
    let end: Date;
    if (startParam && endParam) {
      start = new Date(startParam);
      end = new Date(endParam);
    } else {
      const now = new Date();
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    // totals
    const incomeAgg = await prisma.transaction.aggregate({
      where: { date: { gte: start, lte: end }, type: "income" },
      _sum: { amount: true },
    });
    const expenseAgg = await prisma.transaction.aggregate({
      where: { date: { gte: start, lte: end }, type: "expense" },
      _sum: { amount: true },
    });

    const totalIncome = incomeAgg._sum.amount ?? 0;
    const totalExpenses = expenseAgg._sum.amount ?? 0;

    const transactionCount = await prisma.transaction.count({
      where: { date: { gte: start, lte: end } },
    });

    // category breakdown (expenses)
    const byCategory = await prisma.transaction.groupBy({
      by: ["category"],
      where: { date: { gte: start, lte: end }, type: "expense" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 20,
    });

    // daily trend (simple in-memory reduce)
    const txs = await prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
    const dailyMap: Record<string, { income: number; expense: number }> = {};
    for (const t of txs) {
      const key = t.date.toISOString().slice(0, 10);
      if (!dailyMap[key]) dailyMap[key] = { income: 0, expense: 0 };
      if (t.type === "income") dailyMap[key].income += t.amount;
      else dailyMap[key].expense += t.amount;
    }

    const trend = Object.keys(dailyMap)
      .sort()
      .map((date) => ({ date, ...dailyMap[date] }));

    return NextResponse.json({
      totals: {
        totalIncome,
        totalExpenses,
        net: totalIncome - totalExpenses,
        transactionCount,
      },
      byCategory,
      trend,
      start: start.toISOString(),
      end: end.toISOString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to compute stats" },
      { status: 500 }
    );
  }
}
