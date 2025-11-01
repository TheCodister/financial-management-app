import { Button } from "@/components/ui/button";
import { Home, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Finance Manager</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/transactions" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Transactions
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link
                href="/transactions/add"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

