
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, CheckCircle } from "lucide-react"; // Using CheckCircle for completed tasks
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskAssignmentForm from "@/components/tasks/TaskAssignmentForm"; // Re-using this form, but context changes
import type { AssignedTask, Employee, TaskType } from "@/lib/types";

// Mock data fetching functions
async function getLoggedWorkData(): Promise<AssignedTask[]> { // Renamed from getAssignedTasksData
  await new Promise(resolve => setTimeout(resolve, 100));
  // Status is now always "Completed" and total_payment should be present
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

export default function WorkLogPage() { // Renamed from TaskAssignmentsPage
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [loggedWork, setLoggedWork] = React.useState<AssignedTask[]>([]); // Renamed
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [workData, employeesData, taskTypesData] = await Promise.all([ // Renamed tasksData
      getLoggedWorkData(),
      getMockEmployeesData(),
      getMockTaskTypesData(),
    ]);
    setLoggedWork(workData); // Renamed
    setEmployees(employeesData);
    setTaskTypes(taskTypesData);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    fetchData(); // Re-fetch data after successful form submission
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Work Log</h2> 
          <p className="text-muted-foreground">
            Log completed work for employees and track associated payments.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" disabled>
            <ListFilter className="mr-2 h-4 w-4" /> Filter Log
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
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
              <TaskAssignmentForm // Still uses the same form component
                employees={employees} 
                taskTypes={taskTypes} 
                setOpen={setIsFormOpen} 
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
          ) : loggedWork.length > 0 ? ( // Renamed
            <div className="space-y-3">
              {loggedWork.map(task => ( // Renamed
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-start hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold font-headline">{task.task_name || `Task ID: ${task.task_type_id}`}</h3>
                    <p className="text-sm text-muted-foreground">Employee: {task.employee_name || `Emp. ID: ${task.employee_id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {task.quantity_completed} | Date: {new Date(task.date_assigned).toLocaleDateString()} | Payment: ${task.total_payment.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="default">
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
          Logging work assumes immediate completion and calculates payment. This payment is conceptually added to the employee's balance. Employee withdrawals can be recorded on the Employees page.
        </p>
      </div>
    </div>
  );
}
