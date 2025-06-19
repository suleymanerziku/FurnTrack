
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, Loader2 } from "lucide-react";
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
import { getAssignedTasks, getTaskTypes } from "@/lib/actions/task.actions";
import { getBasicEmployees } from "@/lib/actions/employee.actions"; // Use basic to avoid fetching full balances

export default function TaskAssignmentsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [assignedTasks, setAssignedTasks] = React.useState<AssignedTask[]>([]);
  const [employees, setEmployees] = React.useState<Pick<Employee, 'id' | 'name' | 'role'>[]>([]);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, employeesData, taskTypesData] = await Promise.all([
        getAssignedTasks(),
        getBasicEmployees(),
        getTaskTypes(),
      ]);
      setAssignedTasks(tasksData);
      setEmployees(employeesData);
      setTaskTypes(taskTypesData);
    } catch (error) {
      console.error("Failed to fetch data for task assignments", error);
      // Show toast or error message
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    fetchData(); 
  };

  const getStatusBadgeVariant = (status?: AssignedTask["status"]) => {
    if (status === "Completed") return "default";
    if (status === "In Progress") return "secondary";
    if (status === "Pending Payment") return "outline";
    return "default";
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Task Assignments</h2>
          <p className="text-muted-foreground">
            Assign tasks to employees and track their completion.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" disabled>
            <ListFilter className="mr-2 h-4 w-4" /> Filter Tasks
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
                <DialogDescription>
                  Select an employee, task type, quantity, and assignment date.
                </DialogDescription>
              </DialogHeader>
              <TaskAssignmentForm 
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
          <CardTitle>Current Task Assignments</CardTitle>
          <CardDescription>Overview of tasks assigned to employees.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading task assignments...</p>
            </div>
          ) : assignedTasks.length > 0 ? (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-start hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold font-headline">{task.task_name || `Task Type ID: ${task.task_type_id}`}</h3>
                    <p className="text-sm text-muted-foreground">Assigned to: {task.employee_name || `Emp. ID: ${task.employee_id}`}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {task.quantity_completed} | Date: {new Date(task.date_assigned).toLocaleDateString()}</p>
                     <p className="text-sm text-muted-foreground">Total Payment: ${task.total_payment.toFixed(2)}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(task.status)}>{task.status || "Unknown"}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks currently assigned.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">System Note</h3>
        <p className="text-sm text-accent-foreground/70">
         Task assignment functionality is now connected to the database. Payment is calculated upon assignment, assuming immediate completion. This will reflect in employee balances.
        </p>
      </div>
    </div>
  );
}
