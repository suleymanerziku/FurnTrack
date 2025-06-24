
import { getEmployeeDetailsPageData, deleteEmployee } from "@/lib/actions/employee.actions";
import type { EmployeeDetailsPageData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserCircle, CalendarDays, DollarSign, Briefcase, Edit, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
// Client component for delete confirmation
import EmployeeDeleteButton from "./EmployeeDeleteButton";


export default async function EmployeeDetailSettingsPage({ params }: { params: { id: string } }) {
  const data: EmployeeDetailsPageData = await getEmployeeDetailsPageData(params.id);

  if (!data.employee) {
    notFound(); // Or redirect to /settings/employees with an error
  }

  const { employee, transactions, currentBalance } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="w-full sm:w-auto flex-grow">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/settings/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight font-headline truncate">{employee.name}</h2>
          <p className="text-muted-foreground">{employee.role || "N/A"}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
            <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`text-2xl font-bold font-headline ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentBalance)}
                </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" asChild>
                    <Link href={`/settings/employees/${employee.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
                <EmployeeDeleteButton employeeId={employee.id} employeeName={employee.name} />
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="flex items-start space-x-3">
            <UserCircle className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{employee.contact_info || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(new Date(employee.start_date), "PPP")}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 sm:col-span-2">
             <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{employee.address || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Transaction History</CardTitle>
          <CardDescription>
            Chronological list of earnings and withdrawals for {employee.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Running Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), "PP")}</TableCell>
                    <TableCell className="max-w-[150px] sm:max-w-[300px] truncate">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'Work Logged' ? 'default' : 'secondary'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className={`text-right font-medium hidden sm:table-cell ${tx.runningBalance >= 0 ? '' : 'text-red-500'}`}>
                      {formatCurrency(tx.runningBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No transactions found for this employee.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
