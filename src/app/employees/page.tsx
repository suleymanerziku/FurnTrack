
"use client"; 

import * as React from "react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Eye, MinusCircle, Loader2 } from "lucide-react"; 
import type { Employee } from "@/lib/types"; 
import { getEmployeesWithBalances } from "@/lib/actions/employee.actions"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmployeeWithdrawalForm from "@/components/employees/EmployeeWithdrawalForm";

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const employeesData = await getEmployeesWithBalances();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      // Optionally, show a toast message here
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawalSuccess = () => {
    fetchData(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Employee Management</h2>
          <p className="text-muted-foreground">
            View, add, and manage employee profiles and withdrawals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isWithdrawalFormOpen} onOpenChange={setIsWithdrawalFormOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <MinusCircle className="mr-2 h-4 w-4" /> Record Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Employee Withdrawal</DialogTitle>
                <DialogDescription>
                  Select employee and enter withdrawal details. This will deduct from their balance.
                </DialogDescription>
              </DialogHeader>
              <EmployeeWithdrawalForm
                employees={employees} // Pass currently fetched employees
                setOpen={setIsWithdrawalFormOpen}
                onSuccess={handleWithdrawalSuccess}
              />
            </DialogContent>
          </Dialog>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>A list of all employees and their current balances.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading employees...</p>
            </div>
          ) : employees.length > 0 ? (
            <ul className="space-y-2">
              {employees.map(emp => (
                <li key={emp.id} className="p-4 border rounded-lg shadow-sm hover:bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold font-headline">{emp.name}</h3>
                      <p className="text-sm text-muted-foreground">{emp.role || 'N/A'} - Started: {new Date(emp.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`font-semibold ${(emp.pending_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Balance: ${(emp.pending_balance || 0).toFixed(2)}
                      </p>
                       <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
                        <Link href={`/employees/${emp.id}`}>
                          <Eye className="mr-1 h-3 w-3" /> View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No employees found. Add a new employee to get started.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">System Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Employee balances are calculated based on logged work (earnings) and recorded withdrawals (deductions). Transaction history and precise balance tracking are available in "View Details".
        </p>
      </div>
    </div>
  );
}
