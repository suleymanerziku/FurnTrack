
"use client"; 

import * as React from "react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Eye, MinusCircle, Loader2, Edit, Trash2, ArrowLeft } from "lucide-react"; 
import type { Employee } from "@/lib/types"; 
import { getEmployeesWithBalances, deleteEmployee } from "@/lib/actions/employee.actions"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EmployeeWithdrawalForm from "@/components/employees/EmployeeWithdrawalForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function EmployeesSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = React.useState(false);
  
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const employeesData = await getEmployeesWithBalances();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load employees." });
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawalSuccess = () => {
    fetchData(); 
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteEmployee(employeeToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        fetchData(); // Re-fetch data
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete employee." });
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </Button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Employee Management</h2>
          <p className="text-muted-foreground">
            View, add, edit, delete, and manage employee profiles and withdrawals.
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
                employees={employees} 
                setOpen={setIsWithdrawalFormOpen}
                onSuccess={handleWithdrawalSuccess}
              />
            </DialogContent>
          </Dialog>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/settings/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              "{employeeToDelete?.name}". Related data might be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <ul className="space-y-3">
              {employees.map(emp => (
                <li key={emp.id} className="p-4 border rounded-lg shadow-sm hover:bg-muted/50">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <h3 className="font-semibold font-headline">{emp.name}</h3>
                      <p className="text-sm text-muted-foreground">{emp.role || 'N/A'} - Started: {new Date(emp.start_date).toLocaleDateString()}</p>
                       <p className={`text-sm font-semibold ${(emp.pending_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Balance: ${(emp.pending_balance || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                       <Button variant="outline" size="sm" asChild>
                        <Link href={`/settings/employees/${emp.id}`}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Link>
                      </Button>
                       <Button variant="outline" size="sm" asChild>
                        <Link href={`/settings/employees/${emp.id}/edit`}>
                          <Edit className="mr-1 h-3 w-3" /> Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteDialog(emp)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
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
