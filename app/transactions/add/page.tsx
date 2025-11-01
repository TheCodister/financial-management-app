import { TransactionForm } from "@/components/transactions/TransactionForm";

export const metadata = {
  title: "Add Transaction - Personal Finance Manager",
  description: "Add a new income or expense transaction",
};

export default function AddTransactionPage() {
  return (
    <div className="container max-w-5xl py-6">
      <TransactionForm />
    </div>
  );
}
