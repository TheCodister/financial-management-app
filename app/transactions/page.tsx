import { TransactionList } from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transactions | Finance Manager",
  description: "View and manage your transactions",
};

export default function TransactionsPage() {
  return (
    <main className="container max-w-6xl py-4 space-y-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transactions
          </p>
        </div>
        <Button asChild>
          <Link href="/transactions/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Link>
        </Button>
      </div>

      <TransactionList />
    </main>
  );
}
