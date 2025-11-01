import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
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

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        category,
        description: description ?? null,
        date: parsedDate,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
