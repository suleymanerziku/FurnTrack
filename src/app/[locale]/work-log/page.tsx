
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, CheckCircle, Loader2, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskAssignmentForm from "@/components/tasks/TaskAssignmentForm";
import EmployeePaymentForm from "@/components/employees/EmployeePaymentForm";
import type { AssignedTask, Employee, TaskType, Payment } from "@/lib/types";
import { getLoggedWork, getTaskTypes } from "@/lib/actions/task.actions";
import { getEmployeesWithBalances, getRecentPayments } from "@/lib/actions/employee.actions";
import { useToast } from "@/hooks/use-toast";
import EmployeeTransactionHistoryDialog from "@/components/employees/EmployeeTransactionHistoryDialog";
import { format } from "date-fns";

export default function WorkLogPage() {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = React.useState(false);
  const [loggedWork, setLoggedWork] = React.useState<AssignedTask[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [recentPayments, setRecentPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [currentEmployeeFilter, setCurrentEmployeeFilter] = React.useState<string>("");
  const [currentTaskTypeFilter, setCurrentTaskTypeFilter] = React.useState<string>("");

  const [appliedFilters, setAppliedFilters] = React.useState<{
    employeeId: string | null;
    taskTypeId: string | null;
  }>({ employeeId: null, taskTypeId: null });

  const fetchData = async (filters?: { employeeId?: string | null, taskTypeId?: string | null }) => {
    setIsLoading(true);
    try {
      const [workData, employeesData, taskTypesData, paymentsData] = await Promise.all([
        getLoggedWork(filters),
        getEmployeesWithBalances(),
        getTaskTypes(),
        getRecentPayments(),
      ]);
      setLoggedWork(workData);
      setEmployees(employeesData);
      setTaskTypes(taskTypesData);
      setRecentPayments(paymentsData);
    } catch (error) {
      console.error("Failed to fetch data for work log", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load data for work log." });
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData(appliedFilters);
  }, [appliedFilters, toast]);

  const handleFormSuccess = () => {
    fetchData(appliedFilters);
  };

  const handleOpenFilterDialog = () => {
    setCurrentEmployeeFilter(appliedFilters.employeeId || "");
    setCurrentTaskTypeFilter(appliedFilters.taskTypeId || "");
    setIsFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      employeeId: currentEmployeeFilter || null,
      taskTypeId: currentTaskTypeFilter || null,
    });
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    setCurrentEmployeeFilter("");
    setCurrentTaskTypeFilter("");
    setAppliedFilters({ employeeId: null, taskTypeId: null });
    setIsFilterDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Work &amp; Payment Log</h2>
          <p className="text-muted-foreground">
            Log completed work for employees and record payments.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleOpenFilterDialog}>
                <ListFilter className="mr-2 h-4 w-4" /> Filter Log
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Work Log</DialogTitle>
                <DialogDescription>
                  Select criteria to filter the logged work.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filter-employee" className="text-right col-span-1">
                    Employee
                  </Label>
                  <Select
                    value={currentEmployeeFilter}
                    onValueChange={setCurrentEmployeeFilter}
                  >
                    <SelectTrigger id="filter-employee" className="col-span-3">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filter-task-type" className="text-right col-span-1">
                    Task Type
                  </Label>
                  <Select
                    value={currentTaskTypeFilter}
                    onValueChange={setCurrentTaskTypeFilter}
                  >
                    <SelectTrigger id="filter-task-type" className="col-span-3">
                      <SelectValue placeholder="All Task Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <MinusCircle className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Employee Payment</DialogTitle>
                <DialogDescription>
                  Select employee and enter payment details. This will deduct from their balance.
                </DialogDescription>
              </DialogHeader>
              <EmployeePaymentForm
                employees={employees}
                setOpen={setIsPaymentFormOpen}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Log New Work
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] flex flex-col max-h-[85vh]">
              <DialogHeader className="shrink-0">
                <DialogTitle>Log New Completed Work</DialogTitle>
                <DialogDescription>
                  Select employee, task, quantity, and date. Payment will be calculated.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow p-4">
                <TaskAssignmentForm 
                  employees={employees}
                  taskTypes={taskTypes}
                  setOpen={setIsTaskFormOpen}
                  onSuccess={handleFormSuccess}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payment Log</CardTitle>
          <CardDescription>
            A log of recent employee payments. Click a card to see full history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px] pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg flex justify-between items-center animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-muted-foreground/30 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentPayments.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.map(wd => (
                  <EmployeeTransactionHistoryDialog key={wd.id} employeeId={wd.employee_id} employeeName={wd.employee_name || 'N/A'}>
                    <DialogTrigger asChild>
                      <button className="w-full text-left p-3 border rounded-lg shadow-sm hover:bg-muted/50 transition-colors">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="col-span-2">
                              <p className="font-semibold font-headline text-primary">
                                {wd.employee_name || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">{format(new Date(wd.date), "PPP")}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-lg font-bold text-red-600">
                                -${wd.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate" title={wd.notes || ''}>{wd.notes || 'No notes'}</p>
                          </div>
                        </div>
                      </button>
                    </DialogTrigger>
                  </EmployeeTransactionHistoryDialog>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No payments recorded yet.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Work Log</CardTitle>
          <CardDescription>
            {(appliedFilters.employeeId || appliedFilters.taskTypeId) 
              ? `Filtered view. Showing ${loggedWork.length} records.`
              : "Overview of all work logged and payments calculated." }
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading work log...</p>
            </div>
          ) : loggedWork.length > 0 ? (
            <div className="space-y-3">
              {loggedWork.map(task => (
                <EmployeeTransactionHistoryDialog key={task.id} employeeId={task.employee_id} employeeName={task.employee_name || 'N/A'}>
                  <DialogTrigger asChild>
                    <button className="w-full text-left p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-start hover:bg-muted/50 transition-colors">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="font-semibold font-headline">{task.task_name || `Task ID: ${task.task_type_id}`}</h3>
                        <p className="text-sm text-muted-foreground">Employee: {task.employee_name || `Emp. ID: ${task.employee_id}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {task.quantity_completed} | Date: {new Date(task.date_assigned).toLocaleDateString()} | Payment: ${task.total_payment.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="default" className="mt-2 sm:mt-0 self-start sm:self-center">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {task.status || "Completed"}
                      </Badge>
                    </button>
                  </DialogTrigger>
                </EmployeeTransactionHistoryDialog>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              { (appliedFilters.employeeId || appliedFilters.taskTypeId) && employees.length > 0 && taskTypes.length > 0
                ? "No work logs match the current filters."
                : "No work logged yet."
              }
            </p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">System Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Logging work assumes immediate completion and calculates payment, which affects employee balances. Employee payments can also be recorded on this page. Filters apply to the current view only.
        </p>
      </div>
    </div>
  );
}
