
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getEmployeeDetailsPageData } from "@/lib/actions/employee.actions";
import type { EmployeeDetailsPageData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EmployeeTransactionHistoryDialogProps {
  employeeId: string;
  employeeName: string;
  children: React.ReactNode;
}

export default function EmployeeTransactionHistoryDialog({ employeeId, employeeName, children }: EmployeeTransactionHistoryDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<EmployeeDetailsPageData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && !data) {
      const fetchData = async () => {
        setIsLoading(true);
        const result = await getEmployeeDetailsPageData(employeeId);
        setData(result);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isOpen, data, employeeId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Transaction History: {employeeName}</DialogTitle>
          <DialogDescription>
            A complete record of earnings and withdrawals for this employee.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-10">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading history...
          </div>
        ) : data && data.employee ? (
          <>
            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Current Balance</span>
                <span className={cn(
                  'text-lg font-bold',
                  data.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                    {formatCurrency(data.currentBalance)}
                </span>
            </div>
            <ScrollArea className="flex-grow border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Running Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.length > 0 ? (
                    data.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), "PP")}</TableCell>
                      <TableCell className="max-w-[150px] sm:max-w-[300px] truncate">{tx.description}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'Work Logged' ? 'default' : 'secondary'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        'text-right font-medium',
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className={cn(
                        'text-right font-medium hidden sm:table-cell',
                        tx.runningBalance >= 0 ? '' : 'text-red-500'
                        )}>
                        {formatCurrency(tx.runningBalance)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">Could not load employee transaction history.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
