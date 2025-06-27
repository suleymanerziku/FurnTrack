
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, CheckCircle, Loader2, MinusCircle, CalendarIcon, Edit } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import EditWorkLogForm from "@/components/tasks/EditWorkLogForm"; // New import
import type { AssignedTask, Employee, TaskType, Payment } from "@/lib/types";
import { getLoggedWork, getTaskTypes } from "@/lib/actions/task.actions";
import { getEmployeesWithBalances, getRecentPayments } from "@/lib/actions/employee.actions";
import { useToast } from "@/hooks/use-toast";
import EmployeeTransactionHistoryDialog from "@/components/employees/EmployeeTransactionHistoryDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

export default function WorkLogPage() {
  const { toast } = useToast();
  const t = useI18n();
  
  // Dialog states for creating new records
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = React.useState(false);
  
  // Data states
  const [loggedWork, setLoggedWork] = React.useState<AssignedTask[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [recentPayments, setRecentPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filter states
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [currentEmployeeFilter, setCurrentEmployeeFilter] = React.useState<string>("");
  const [currentTaskTypeFilter, setCurrentTaskTypeFilter] = React.useState<string>("");
  const [currentDateFilter, setCurrentDateFilter] = React.useState<Date | undefined>(undefined);
  const [appliedFilters, setAppliedFilters] = React.useState<{ employeeId: string | null; taskTypeId: string | null; date: Date | null; }>({ employeeId: null, taskTypeId: null, date: null });

  // Editing states
  const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null);
  const [editingTask, setEditingTask] = React.useState<AssignedTask | null>(null);

  const fetchData = async (filters?: { employeeId?: string | null, taskTypeId?: string | null, date?: Date | null }) => {
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
  }, [appliedFilters]);

  const handleFormSuccess = () => {
    fetchData(appliedFilters);
    setEditingPayment(null);
    setEditingTask(null);
  };

  const handleOpenFilterDialog = () => {
    setCurrentEmployeeFilter(appliedFilters.employeeId || "");
    setCurrentTaskTypeFilter(appliedFilters.taskTypeId || "");
    setCurrentDateFilter(appliedFilters.date || undefined);
    setIsFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      employeeId: currentEmployeeFilter || null,
      taskTypeId: currentTaskTypeFilter || null,
      date: currentDateFilter || null,
    });
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    setCurrentEmployeeFilter("");
    setCurrentTaskTypeFilter("");
    setCurrentDateFilter(undefined);
    setAppliedFilters({ employeeId: null, taskTypeId: null, date: null });
    setIsFilterDialogOpen(false);
  };
  
  const isAnyFilterActive = appliedFilters.employeeId || appliedFilters.taskTypeId || appliedFilters.date;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">{t('work_log_page.title')}</h2>
          <p className="text-muted-foreground">
            {t('work_log_page.description')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleOpenFilterDialog}>
                <ListFilter className="mr-2 h-4 w-4" /> {t('work_log_page.filter_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('work_log_page.filter_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('work_log_page.filter_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filter-employee" className="text-right col-span-1">
                    {t('work_log_page.filter_dialog.employee_label')}
                  </Label>
                  <Select
                    value={currentEmployeeFilter}
                    onValueChange={setCurrentEmployeeFilter}
                  >
                    <SelectTrigger id="filter-employee" className="col-span-3">
                      <SelectValue placeholder={t('work_log_page.filter_dialog.all_employees_placeholder')} />
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
                    {t('work_log_page.filter_dialog.task_type_label')}
                  </Label>
                  <Select
                    value={currentTaskTypeFilter}
                    onValueChange={setCurrentTaskTypeFilter}
                  >
                    <SelectTrigger id="filter-task-type" className="col-span-3">
                      <SelectValue placeholder={t('work_log_page.filter_dialog.all_task_types_placeholder')} />
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
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filter-date" className="text-right">
                    {t('work_log_page.filter_dialog.date_label')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !currentDateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDateFilter ? format(currentDateFilter, "PPP") : <span>{t('work_log_page.filter_dialog.date_placeholder')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentDateFilter}
                        onSelect={(date) => setCurrentDateFilter(date || undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClearFilters}>{t('work_log_page.filter_dialog.clear_button')}</Button>
                <Button onClick={handleApplyFilters}>{t('work_log_page.filter_dialog.apply_button')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto border border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive">
                <MinusCircle className="mr-2 h-4 w-4" /> {t('work_log_page.record_payment_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('work_log_page.payment_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('work_log_page.payment_dialog.description')}
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
                <PlusCircle className="mr-2 h-4 w-4" /> {t('work_log_page.log_work_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] flex flex-col max-h-[85vh]">
              <DialogHeader className="shrink-0">
                <DialogTitle>{t('work_log_page.log_work_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('work_log_page.log_work_dialog.description')}
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
          <CardTitle>{t('work_log_page.work_log.title')}</CardTitle>
          <CardDescription>
            {isAnyFilterActive 
              ? t('work_log_page.work_log.description_filtered', { count: loggedWork.length })
              : t('work_log_page.work_log.description_default') }
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">{t('work_log_page.work_log.loading')}</p>
            </div>
          ) : loggedWork.length > 0 ? (
            <div className="space-y-3">
              {loggedWork.map(task => {
                const isEditable = new Date().getTime() - new Date(task.created_at).getTime() < SIX_HOURS_IN_MS;
                return(
                  <div key={task.id} className="flex items-center gap-2">
                    <EmployeeTransactionHistoryDialog employeeId={task.employee_id} employeeName={task.employee_name || 'N/A'}>
                      <DialogTrigger asChild>
                        <button className="flex-grow text-left p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-start hover:bg-muted/50 transition-colors">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="font-semibold font-headline">{task.task_name || `Task ID: ${task.task_type_id}`}</h3>
                            <p className="text-sm text-muted-foreground">{t('work_log_page.work_log.employee_label')}: {task.employee_name || `Emp. ID: ${task.employee_id}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('work_log_page.work_log.quantity_label')}: {task.quantity_completed} | {t('work_log_page.work_log.date_label')}: {new Date(task.date_assigned).toLocaleDateString()} | {t('work_log_page.work_log.payment_label')}: ${task.total_payment.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="default" className="mt-2 sm:mt-0 self-start sm:self-center">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {task.status || "Completed"}
                          </Badge>
                        </button>
                      </DialogTrigger>
                    </EmployeeTransactionHistoryDialog>
                     <Button variant="outline" size="sm" disabled={!isEditable} onClick={() => setEditingTask(task)} title={isEditable ? "Edit work log" : "Cannot edit records older than 6 hours"}>
                        <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">
              { isAnyFilterActive && employees.length > 0 && taskTypes.length > 0
                ? t('work_log_page.work_log.no_data_filtered')
                : t('work_log_page.work_log.no_data')
              }
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('work_log_page.payment_log.title')}</CardTitle>
          <CardDescription>
            {t('work_log_page.payment_log.description')}
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
                {recentPayments.map(payment => {
                  const isEditable = new Date().getTime() - new Date(payment.created_at).getTime() < SIX_HOURS_IN_MS;
                  return (
                    <div key={payment.id} className="flex items-center gap-2">
                      <EmployeeTransactionHistoryDialog employeeId={payment.employee_id} employeeName={payment.employee_name || 'N/A'}>
                        <DialogTrigger asChild>
                          <button className="flex-grow text-left p-3 border rounded-lg shadow-sm hover:bg-muted/50 transition-colors">
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-2">
                                  <p className="font-semibold font-headline text-primary">
                                    {payment.employee_name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{format(new Date(payment.date), "PPP")}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-lg font-bold text-red-600">
                                    -${payment.amount.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate" title={payment.notes || ''}>{payment.notes || 'No notes'}</p>
                              </div>
                            </div>
                          </button>
                        </DialogTrigger>
                      </EmployeeTransactionHistoryDialog>
                      <Button variant="outline" size="sm" disabled={!isEditable} onClick={() => setEditingPayment(payment)} title={isEditable ? "Edit payment" : "Cannot edit records older than 6 hours"}>
                          <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">{t('work_log_page.payment_log.no_data')}</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Edit Payment Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update the details of the payment. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <EmployeePaymentForm setOpen={(open) => !open && setEditingPayment(null)} onSuccess={handleFormSuccess} currentPayment={editingPayment} employees={employees} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Work Log Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Work Log</DialogTitle>
            <DialogDescription>Update the quantity or date for this completed task.</DialogDescription>
          </DialogHeader>
          {editingTask && <EditWorkLogForm setOpen={(open) => !open && setEditingTask(null)} onSuccess={handleFormSuccess} task={editingTask} />}
        </DialogContent>
      </Dialog>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">{t('work_log_page.system_note.title')}</h3>
        <p className="text-sm text-accent-foreground/70">
          {t('work_log_page.system_note.content')}
        </p>
      </div>
    </div>
  );
}
