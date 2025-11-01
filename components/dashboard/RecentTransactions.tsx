"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate, getTransactionColor } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  limit?: number;
}

export function RecentTransactions({
  transactions,
  onDelete,
  limit = 10,
}: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, limit);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete transaction");

      if (onDelete) {
        onDelete(id);
      }
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        {displayTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-medium">Date</th>
                <th className="p-3 text-left text-sm font-medium">Type</th>
                <th className="p-3 text-left text-sm font-medium">Category</th>
                <th className="p-3 text-left text-sm font-medium">
                  Description
                </th>
                <th className="p-3 text-right text-sm font-medium">Amount</th>
                <th className="p-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 whitespace-nowrap text-sm">
                    {formatDate(tx.date)}
                  </td>
                  <td className={`p-3 text-sm ${getTransactionColor(tx.type)}`}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </td>
                  <td className="p-3 text-sm">{tx.category}</td>
                  <td className="p-3 text-sm max-w-xs truncate">
                    {tx.description || "-"}
                  </td>
                  <td
                    className={`p-3 text-right text-sm font-medium ${getTransactionColor(tx.type)}`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <Link href={`/transactions/edit/${tx.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {displayTransactions.length > 0 && (
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}

