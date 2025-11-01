import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams;

    const type = q.get("type") ?? "all";
    const category = q.get("category") ?? undefined;
    const startDate = q.get("startDate") ?? undefined;
    const endDate = q.get("endDate") ?? undefined;
    const page = Number(q.get("page") ?? "1");
    const limit = Number(q.get("limit") ?? "20");
    const sortBy = (q.get("sortBy") as string) ?? "date";
    const sortOrder = (q.get("sortOrder") as string) ?? "desc";

    const where: Record<string, unknown> = {};
    if (type && type !== "all") where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      const whereDate: { gte?: Date; lte?: Date } = {};
      if (startDate) whereDate.gte = new Date(startDate);
      if (endDate) whereDate.lte = new Date(endDate);
      // assign the constructed date filter to where
      (where as Record<string, unknown>)["date"] = whereDate;
    }

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ transactions, total, page, totalPages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date } = body;

    if (!type || (type !== "income" && type !== "expense")) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category required" }, { status: 400 });
    }
    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (parsedDate > new Date()) {
      return NextResponse.json(
        { error: "Date cannot be in the future" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description: description ?? null,
        date: parsedDate,
      },
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
