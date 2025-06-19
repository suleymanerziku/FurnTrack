
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, CheckCircle } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskAssignmentForm from "@/components/tasks/TaskAssignmentForm"; 
import type { AssignedTask, Employee, TaskType } from "@/lib/types";

// Mock data fetching functions
async function getLoggedWorkData(): Promise<AssignedTask[]> { 
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: "1", employee_id: "emp1", task_type_id: "tt1", employeeName: "Alice Smith", task_name: "Chair Making", quantity_completed: 5, date_assigned: "2024-07-28", status: "Completed", total_payment: 250, created_at: new Date().toISOString() },
    { id: "2", employee_id: "emp2", task_type_id: "tt2", employeeName: "Bob Johnson", task_name: "Table Assembly", quantity_completed: 2, date_assigned: "2024-07-27", status: "Completed", total_payment: 150, created_at: new Date().toISOString() },
    { id: "3", employee_id: "emp1", task_type_id: "tt3", employeeName: "Alice Smith", task_name: "Painting - Small Item", quantity_completed: 10, date_assigned: "2024-07-26", status: "Completed", total_payment: 200, created_at: new Date().toISOString() },
  ];
}

async function getMockEmployeesData(): Promise<Employee[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [
    { id: "emp1", name: "Alice Smith", role: "Carpenter", start_date: "2023-01-10", created_at: new Date().toISOString() },
    { id: "emp2", name: "Bob Johnson", role: "Painter", start_date: "2022-11-05", created_at: new Date().toISOString() },
  ];
}

async function getMockTaskTypesData(): Promise<TaskType[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [
    { id: "tt1", name: "Chair Making", unit_price: 50.00, created_at: new Date().toISOString() },
    { id: "tt2", name: "Table Assembly", unit_price: 75.00, created_at: new Date().toISOString() },
    { id: "tt3", name: "Painting - Small Item", unit_price: 20.00, created_at: new Date().toISOString() },
  ];
}

export default function WorkLogPage() { 
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [loggedWork, setLoggedWork] = React.useState<AssignedTask[]>([]); 
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [workData, employeesData, taskTypesData] = await Promise.all([ 
      getLoggedWorkData(),
      getMockEmployeesData(),
      getMockTaskTypesData(),
    ]);
    setLoggedWork(workData); 
    setEmployees(employeesData);
    setTaskTypes(taskTypesData);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    fetchData(); 
  };
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Work Log</h2> 
          <p className="text-muted-foreground">
            Log completed work for employees.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" disabled className="w-full sm:w-auto">
            <ListFilter className="mr-2 h-4 w-4" /> Filter Log
          </Button>
          
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Log New Work
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Log New Completed Work</DialogTitle>
                <DialogDescription>
                  Select employee, task, quantity, and date. Payment will be calculated.
                </DialogDescription>
              </DialogHeader>
              <TaskAssignmentForm 
                employees={employees} 
                taskTypes={taskTypes} 
                setOpen={setIsTaskFormOpen} 
                onSuccess={handleFormSuccess} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Work Log</CardTitle>
          <CardDescription>Overview of all work logged and payments calculated.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading work log...</p>
          ) : loggedWork.length > 0 ? ( 
            <div className="space-y-3">
              {loggedWork.map(task => ( 
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-start hover:bg-muted/50">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold font-headline">{task.task_name || `Task ID: ${task.task_type_id}`}</h3>
                    <p className="text-sm text-muted-foreground">Employee: {task.employee_name || `Emp. ID: ${task.employee_id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {task.quantity_completed} | Date: {new Date(task.date_assigned).toLocaleDateString()} | Payment: ${task.total_payment.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="default" className="mt-2 sm:mt-0 self-start sm:self-center">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No work logged yet.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">System Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Logging work assumes immediate completion and calculates payment. This payment is conceptually added to the employee's balance. Employee withdrawals can be recorded on the "Employees" page, affecting their balances.
        </p>
      </div>
    </div>
  );
}

