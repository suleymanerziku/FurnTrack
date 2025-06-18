
"use client"; // Converted to client component

import * as React from "react"; // Import React
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, MinusCircle, User, Eye } from "lucide-react"; // Added Eye
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmployeeWithdrawalForm from "@/components/employees/EmployeeWithdrawalForm";
import type { Employee } from "@/lib/types"; // Import Employee type
import { getEmployeeDetailsPageData } from "@/lib/actions/employee.actions"; // To update balances on list after detail view potentially

// Mock function, replace with actual data fetching
// This function is simplified as balance calculation is now more complex
// and primarily handled by getEmployeeDetailsPageData for the detail view.
// For the list, we'll show balances as they are after simulated updates.
async function getEmployeesListData(): Promise<Employee[]> { 
  await new Promise(resolve => setTimeout(resolve, 100));
  // In a real app, this would fetch from a DB where balances are stored or calculated
  // For mock purposes, we rely on balances being updated by other actions
  const MOCK_EMPLOYEES_LIST: Employee[] = [ // Use a distinct mock list if needed or ensure consistency
    { id: "1", name: "Alice Smith", role: "Carpenter", start_date: "2023-01-10", pending_balance: 120.50, created_at: new Date().toISOString() },
    { id: "2", name: "Bob Johnson", role: "Painter", start_date: "2022-11-05", pending_balance: -50.00, created_at: new Date().toISOString() },
    { id: "3", name: "Charlie Brown", role: "Assembler", start_date: "2023-03-15", pending_balance: 210.75, created_at: new Date().toISOString() },
  ];
  // Simulate fetching updated balances (in a real app, DB would be source of truth)
   const updatedEmployees = await Promise.all(MOCK_EMPLOYEES_LIST.map(async (emp) => {
    const details = await getEmployeeDetailsPageData(emp.id);
    return { ...emp, pending_balance: details.currentBalance };
  }));
  return updatedEmployees;
}


export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const employeesData = await getEmployeesListData();
    setEmployees(employeesData);
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
            View, add, manage employee profiles, and record withdrawals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isWithdrawalFormOpen} onOpenChange={setIsWithdrawalFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
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
                employees={employees} // Pass currently listed employees
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
             <p className="text-muted-foreground">Loading employees...</p>
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
          Employee balances are conceptual and will be affected by work logged (earnings) and withdrawals (deductions). Transaction history and precise balance tracking are available in "View Details".
        </p>
      </div>
    </div>
  );
}

