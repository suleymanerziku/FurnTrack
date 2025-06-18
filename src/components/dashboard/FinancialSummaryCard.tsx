"use client";

import type { FinancialSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialSummaryCardProps {
  summary: FinancialSummary;
}

export default function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold font-headline">Financial Overview</CardTitle>
        <CardDescription>This month's financial performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Income</p>
            <p className="text-2xl font-bold font-headline text-green-600 dark:text-green-300">{formatCurrency(summary.total_income)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Total Expenses</p>
            <p className="text-2xl font-bold font-headline text-red-600 dark:text-red-300">{formatCurrency(summary.total_expenses)}</p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div>
            <p className="text-sm font-medium text-primary">Net Income</p>
            <p className="text-2xl font-bold font-headline text-primary">{formatCurrency(summary.net_income)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
