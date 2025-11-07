"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TransactionFormData,
  TransactionType,
  ValidationError,
} from "@/lib/types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";
import { validateAmount, validateDate } from "@/lib/utils";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState<TransactionFormData>({
    type: "expense",
    amount: 0,
    category: "Food & Dining",
    description: "",
    date: new Date(),
  });

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  async function fetchTransaction() {
    try {
      const res = await fetch(`/api/transactions/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const transaction = await res.json();
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || "",
        date: new Date(transaction.date),
      });
    } catch (error) {
      console.error("Failed to fetch transaction:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const categories =
    formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validateForm = useCallback(() => {
    const newErrors: ValidationError = {};
    const amountError = validateAmount(formData.amount.toString());
    const dateError = validateDate(formData.date.toISOString());

    if (amountError) newErrors.amount = amountError;
    if (dateError) newErrors.date = dateError;
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update transaction");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      setErrors({ type: "Failed to update transaction. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category:
        type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  if (loading) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container max-w-5xl py-6">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The transaction you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => router.push("/transactions")}
            >
              Back to Transactions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6">
      <Card className="w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.type && (
              <div className="text-sm font-medium text-destructive">
                {errors.type}
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={handleTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount && (
                <div className="text-sm font-medium text-destructive">
                  {errors.amount}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(category) =>
                  setFormData((prev) => ({ ...prev, category }))
                }
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="text-sm font-medium text-destructive">
                  {errors.category}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={format(formData.date, "yyyy-MM-dd")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: new Date(e.target.value),
                  }))
                }
                max={format(new Date(), "yyyy-MM-dd")}
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && (
                <div className="text-sm font-medium text-destructive">
                  {errors.date}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Transaction"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
