
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, ListOrdered, Loader2, Edit } from "lucide-react";
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
import { useI18n } from "@/locales/client";

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

export default function FinancesPage() {
  const { toast } = useToast();
  const t = useI18n();
  const [activeTab, setActiveTab] = React.useState("sales");
  
  const [isSaleFormOpen, setIsSaleFormOpen] = React.useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);
  
  const [editingSale, setEditingSale] = React.useState<Sale | null>(null);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

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
    setEditingSale(null);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{t('finances_page.title')}</h2>
        <p className="text-muted-foreground">
          {t('finances_page.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('finances_page.summary_card.title')}</CardTitle>
          <CardDescription>{t('finances_page.summary_card.description')}</CardDescription>
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
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">{t('finances_page.summary_card.total_revenue')}</p>
                  <p className="text-2xl font-bold font-headline text-green-600 dark:text-green-300">${(financialSummary.totalRevenue || 0).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{t('finances_page.summary_card.total_expenses')}</p>
                  <p className="text-2xl font-bold font-headline text-red-600 dark:text-red-300">${(financialSummary.totalExpenses || 0).toFixed(2)}</p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{t('finances_page.summary_card.net_income')}</p>
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
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-2">
            <TabsTrigger value="sales">{t('finances_page.sales_tab_trigger')}</TabsTrigger>
            <TabsTrigger value="expenses">{t('finances_page.expenses_tab_trigger')}</TabsTrigger>
          </TabsList>
          
          {activeTab === "sales" ? (
            <Dialog open={isSaleFormOpen} onOpenChange={setIsSaleFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('finances_page.record_sale_button')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('finances_page.sale_dialog.title')}</DialogTitle>
                  <DialogDescription>{t('finances_page.sale_dialog.description')}</DialogDescription>
                </DialogHeader>
                <RecordSaleForm setOpen={setIsSaleFormOpen} onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('finances_page.record_expense_button')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('finances_page.expense_dialog.title')}</DialogTitle>
                  <DialogDescription>{t('finances_page.expense_dialog.description')}</DialogDescription>
                </DialogHeader>
                <RecordExpenseForm setOpen={setIsExpenseFormOpen} onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('finances_page.sales_log_card.title')}</CardTitle>
              <CardDescription>{t('finances_page.sales_log_card.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('finances_page.loading_sales')}
                </div>
              ) : salesData.length > 0 ? (
                salesData.map(sale => {
                  const isEditable = new Date().getTime() - new Date(sale.created_at).getTime() < SIX_HOURS_IN_MS;
                  return (
                    <div key={sale.id} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{sale.product_name} - <span className="text-green-600">${sale.amount.toFixed(2)}</span></p>
                        <p className="text-xs text-muted-foreground">{t('finances_page.date_label')}: {new Date(sale.date).toLocaleDateString()}</p>
                        {sale.receipt_number && <p className="text-xs text-muted-foreground">{t('finances_page.receipt_label')}: {sale.receipt_number}</p>}
                      </div>
                      <Button variant="outline" size="sm" disabled={!isEditable} onClick={() => setEditingSale(sale)} title={isEditable ? "Edit sale" : "Cannot edit records older than 6 hours"}>
                          <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground">{t('finances_page.sales_log_card.no_data')}</p>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" disabled><ListOrdered className="mr-2 h-3 w-3" /> {t('finances_page.sales_log_card.report_button')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('finances_page.expenses_log_card.title')}</CardTitle>
              <CardDescription>{t('finances_page.expenses_log_card.description')}</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('finances_page.loading_expenses')}
                </div>
              ) : expensesData.length > 0 ? (
                expensesData.map(expense => {
                  const isEditable = new Date().getTime() - new Date(expense.created_at).getTime() < SIX_HOURS_IN_MS;
                  return (
                    <div key={expense.id} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{expense.description} - <span className="text-red-600">${expense.amount.toFixed(2)}</span></p>
                        <p className="text-xs text-muted-foreground">{t('finances_page.date_label')}: {new Date(expense.date).toLocaleDateString()}</p>
                        {expense.receipt_number && <p className="text-xs text-muted-foreground">{t('finances_page.receipt_label')}: {expense.receipt_number}</p>}
                      </div>
                       <Button variant="outline" size="sm" disabled={!isEditable} onClick={() => setEditingExpense(expense)} title={isEditable ? "Edit expense" : "Cannot edit records older than 6 hours"}>
                          <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground">{t('finances_page.expenses_log_card.no_data')}</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" size="sm" disabled><ListOrdered className="mr-2 h-3 w-3" /> {t('finances_page.expenses_log_card.report_button')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Sale Dialog */}
      <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Update the details of the sale transaction. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <RecordSaleForm setOpen={(open) => !open && setEditingSale(null)} onSuccess={handleFormSuccess} currentSale={editingSale} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details of the expense. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <RecordExpenseForm setOpen={(open) => !open && setEditingExpense(null)} onSuccess={handleFormSuccess} currentExpense={editingExpense} />
        </DialogContent>
      </Dialog>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">{t('finances_page.system_note.title')}</h3>
        <p className="text-sm text-accent-foreground/70">
          {t('finances_page.system_note.content')}
        </p>
      </div>
    </div>
  );
}
