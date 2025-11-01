"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionCategory,
  type TransactionQueryParams,
  type TransactionType,
} from "@/lib/types";
import { formatCurrency, formatDate, getTransactionColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface DataTableProps {
  initialPage?: number;
  initialLimit?: number;
}

export function TransactionList({
  initialPage = 1,
  initialLimit = 20,
}: DataTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [queryParams, setQueryParams] = useState<
    Required<Pick<TransactionQueryParams, "page" | "limit">> &
      TransactionQueryParams & {
        type: "all" | TransactionType;
        sortBy: NonNullable<TransactionQueryParams["sortBy"]>;
        sortOrder: NonNullable<TransactionQueryParams["sortOrder"]>;
      }
  >({
    page: initialPage,
    limit: initialLimit,
    type: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const fetchTransactions = useCallback(
    async (params: TransactionQueryParams) => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value.toString());
        });

        const res = await fetch(`/api/transactions?${searchParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();
        setTransactions(data.transactions);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(queryParams);
  }, [fetchTransactions, queryParams]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
        description: searchText || undefined,
      }));
    }, 300);
    setSearchTimeout(timeout);
    // Intentionally exclude searchTimeout from deps to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} selected transaction(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/transactions/${id}`, { method: "DELETE" })
        )
      );
      setSelectedIds(new Set());
      fetchTransactions(queryParams);
    } catch (error) {
      console.error("Failed to delete transactions:", error);
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const categories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            value={queryParams.type}
            onValueChange={(type) =>
              setQueryParams((prev) => ({
                ...prev,
                page: 1,
                type: type as "all" | "income" | "expense",
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={queryParams.category || "all"}
            onValueChange={(category) =>
              setQueryParams((prev) => ({
                ...prev,
                page: 1,
                category:
                  category === "all"
                    ? undefined
                    : (category as TransactionCategory),
              }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-auto"
          />
        </div>

        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === transactions.length &&
                      transactions.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      sortBy: "date",
                      sortOrder:
                        prev.sortBy === "date" && prev.sortOrder === "desc"
                          ? "asc"
                          : "desc",
                    }))
                  }
                >
                  Date
                </th>
                <th className="p-3 text-left">Type</th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      sortBy: "category",
                      sortOrder:
                        prev.sortBy === "category" && prev.sortOrder === "desc"
                          ? "asc"
                          : "desc",
                    }))
                  }
                >
                  Category
                </th>
                <th className="p-3 text-left">Description</th>
                <th
                  className="p-3 text-right cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      sortBy: "amount",
                      sortOrder:
                        prev.sortBy === "amount" && prev.sortOrder === "desc"
                          ? "asc"
                          : "desc",
                    }))
                  }
                >
                  Amount
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td
                      className={`p-3 ${getTransactionColor(tx.type as "income" | "expense")}`}
                    >
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </td>
                    <td className="p-3">{tx.category}</td>
                    <td className="p-3">{tx.description || "-"}</td>
                    <td
                      className={`p-3 text-right whitespace-nowrap ${getTransactionColor(tx.type as "income" | "expense")}`}
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
                          onClick={() => {
                            if (
                              confirm(
                                `Delete transaction "${tx.description || tx.category}"?`
                              )
                            ) {
                              fetch(`/api/transactions/${tx.id}`, {
                                method: "DELETE",
                              })
                                .then(() => fetchTransactions(queryParams))
                                .catch((err) =>
                                  console.error("Delete failed:", err)
                                );
                            }
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 flex items-center justify-between border-t">
          <div className="text-sm text-muted-foreground">
            {total} total transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={queryParams.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {queryParams.page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={queryParams.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
