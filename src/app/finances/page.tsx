
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import RecordSaleForm from "@/components/finances/RecordSaleForm";
import RecordExpenseForm from "@/components/finances/RecordExpenseForm";

// Mock data - in a real app, this would come from state or server actions
const salesData = [
  { id: "1", product: "Oak Dining Chair", amount: 150, date: "2024-07-28" },
  { id: "2", product: "Pine Coffee Table", amount: 220, date: "2024-07-27" },
];

const expensesData = [
  { id: "1", description: "Wood Purchase", amount: 500, date: "2024-07-28" },
  { id: "2", description: "Varnish and Glue", amount: 75, date: "2024-07-27" },
];

const financialSummary = {
  totalRevenue: 12530.50,
  totalExpenses: 4870.20,
  netIncome: 12530.50 - 4870.20,
};

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  // Placeholder for re-fetching data after form submission.
  // In a real app, you might use router.refresh() or a state management solution.
  const handleFormSuccess = () => {
    console.log("Form submitted successfully. Consider re-fetching data.");
    // e.g. router.refresh();
    // For now, mock data won't update automatically after submission.
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Financial Management</h2>
        <p className="text-muted-foreground">
          Track sales, expenses, and view overall financial health.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Financial Summary</CardTitle>
          <CardDescription>Key financial metrics for the current period.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-green-500/10 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Revenue</p>
              <p className="text-2xl font-bold font-headline text-green-600 dark:text-green-300">${financialSummary.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Total Expenses</p>
              <p className="text-2xl font-bold font-headline text-red-600 dark:text-red-300">${financialSummary.totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Net Income (Before Tax)</p>
              <p className="text-2xl font-bold font-headline text-primary">${financialSummary.netIncome.toFixed(2)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          {activeTab === "sales" ? (
            <Dialog open={isSaleFormOpen} onOpenChange={setIsSaleFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Record New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record New Sale</DialogTitle>
                  <DialogDescription>
                    Enter the details of the sale transaction. Click record when you're done.
                  </DialogDescription>
                </DialogHeader>
                <RecordSaleForm setOpen={setIsSaleFormOpen} onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Record New Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of the expense. Click record when you're done.
                  </DialogDescription>
                </DialogHeader>
                <RecordExpenseForm setOpen={setIsExpenseFormOpen} onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Sales Log</CardTitle>
              <CardDescription>Record of all product sales.</CardDescription>
            </CardHeader>
            <CardContent>
              {salesData.map(sale => (
                <div key={sale.id} className="py-2 border-b last:border-b-0">
                  <p className="font-medium">{sale.product} - <span className="text-green-600">${sale.amount.toFixed(2)}</span></p>
                  <p className="text-xs text-muted-foreground">Date: {sale.date}</p>
                </div>
              ))}
              {salesData.length === 0 && <p className="text-muted-foreground">No sales recorded yet.</p>}
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" disabled><ListOrdered className="mr-2 h-3 w-3" /> View Full Sales Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Expenses Log</CardTitle>
              <CardDescription>Record of all company expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              {expensesData.map(expense => (
                <div key={expense.id} className="py-2 border-b last:border-b-0">
                  <p className="font-medium">{expense.description} - <span className="text-red-600">${expense.amount.toFixed(2)}</span></p>
                  <p className="text-xs text-muted-foreground">Date: {expense.date}</p>
                </div>
              ))}
              {expensesData.length === 0 && <p className="text-muted-foreground">No expenses recorded yet.</p>}
            </CardContent>
             <CardFooter>
                <Button variant="outline" size="sm" disabled><ListOrdered className="mr-2 h-3 w-3" /> View Full Expenses Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          This section now allows users to input daily sales and expenses via forms. Detailed tables/lists and full data persistence will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
