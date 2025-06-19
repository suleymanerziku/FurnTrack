
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, ListOrdered, Loader2 } from "lucide-react";
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
import type { Sale, Expense, FinancialSummary } from "@/lib/types";
import { getSales, getExpenses, getFinancialSummaryForPeriod } from "@/lib/actions/finance.actions";
import { useToast } from "@/hooks/use-toast";

export default function FinancesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("sales");
  const [isSaleFormOpen, setIsSaleFormOpen] = React.useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);

  const [salesData, setSalesData] = React.useState<Sale[]>([]);
  const [expensesData, setExpensesData] = React.useState<Expense[]>([]);
  const [financialSummary, setFinancialSummary] = React.useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesRes, expensesRes, summaryRes] = await Promise.all([
        getSales(),
        getExpenses(),
        getFinancialSummaryForPeriod()
      ]);
      setSalesData(salesRes);
      setExpensesData(expensesRes);
      setFinancialSummary(summaryRes);
    } catch (error) {
      console.error("Failed to fetch financial data", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load financial data." });
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    fetchData(); // Re-fetch all data on successful submission
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
          <CardDescription>Key financial metrics based on recorded data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {isLoading || !financialSummary ? (
            <>
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between animate-pulse">
                <div className="space-y-2"> <div className="h-4 bg-muted-foreground/20 rounded w-24"></div> <div className="h-6 bg-muted-foreground/30 rounded w-32"></div> </div> <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between animate-pulse">
                <div className="space-y-2"> <div className="h-4 bg-muted-foreground/20 rounded w-24"></div> <div className="h-6 bg-muted-foreground/30 rounded w-32"></div> </div> <TrendingDown className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between animate-pulse">
                <div className="space-y-2"> <div className="h-4 bg-muted-foreground/20 rounded w-24"></div> <div className="h-6 bg-muted-foreground/30 rounded w-32"></div> </div> <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Revenue</p>
                  <p className="text-2xl font-bold font-headline text-green-600 dark:text-green-300">${(financialSummary.totalRevenue || 0).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Total Expenses</p>
                  <p className="text-2xl font-bold font-headline text-red-600 dark:text-red-300">${(financialSummary.totalExpenses || 0).toFixed(2)}</p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Net Income (Before Tax)</p>
                  <p className="text-2xl font-bold font-headline text-primary">${(financialSummary.netIncome || 0).toFixed(2)}</p>
                </div>
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          {activeTab === "sales" ? (
            <Dialog open={isSaleFormOpen} onOpenChange={setIsSaleFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
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
                <Button className="w-full sm:w-auto">
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
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sales...
                </div>
              ) : salesData.length > 0 ? (
                salesData.map(sale => (
                  <div key={sale.id} className="py-2 border-b last:border-b-0">
                    <p className="font-medium">{sale.product_name} - <span className="text-green-600">${sale.amount.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(sale.date).toLocaleDateString()}</p>
                    {sale.receipt_number && <p className="text-xs text-muted-foreground">Receipt: {sale.receipt_number}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No sales recorded yet.</p>
              )}
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
               {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading expenses...
                </div>
              ) : expensesData.length > 0 ? (
                expensesData.map(expense => (
                  <div key={expense.id} className="py-2 border-b last:border-b-0">
                    <p className="font-medium">{expense.description} - <span className="text-red-600">${expense.amount.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(expense.date).toLocaleDateString()}</p>
                    {expense.receipt_number && <p className="text-xs text-muted-foreground">Receipt: {expense.receipt_number}</p>}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No expenses recorded yet.</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" size="sm" disabled><ListOrdered className="mr-2 h-3 w-3" /> View Full Expenses Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Data Persistence</h3>
        <p className="text-sm text-accent-foreground/70">
          Sales and expenses are now recorded in and fetched from the Supabase database. Full reporting features will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
