import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "income" | "expense" | "neutral";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    income: "border-green-500 bg-green-50 dark:bg-green-950/20",
    expense: "border-red-500 bg-red-50 dark:bg-red-950/20",
    neutral: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
  };

  return (
    <Card
      className={cn("transition-all hover:shadow-md", variantStyles[variant])}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

