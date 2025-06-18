
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskTypeForm from "@/components/tasks/TaskTypeForm";
import type { TaskType } from "@/lib/types"; // Import the TaskType interface

// Mock function, replace with actual data fetching
async function getTaskTypesData(): Promise<TaskType[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100)); 
  return [
    { id: "1", name: "Chair Making", description: "Crafting standard wooden chairs", unit_price: 50.00, created_at: new Date().toISOString() },
    { id: "2", name: "Table Assembly", description: "Assembling dining tables", unit_price: 75.00, created_at: new Date().toISOString() },
    { id: "3", name: "Painting - Small Item", description: "Painting small furniture items", unit_price: 20.00, created_at: new Date().toISOString() },
  ];
}


export default function TaskTypesPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTaskTypes = async () => {
    setIsLoading(true);
    const data = await getTaskTypesData();
    setTaskTypes(data);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchTaskTypes();
  }, []);

  const handleFormSuccess = () => {
    fetchTaskTypes(); // Re-fetch data after successful form submission
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Task Type Management</h2>
          <p className="text-muted-foreground">
            Define and manage different types of tasks performed in production.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Task Type</DialogTitle>
              <DialogDescription>
                Enter the details for the new task type. Click add when you're done.
              </DialogDescription>
            </DialogHeader>
            <TaskTypeForm setOpen={setIsFormOpen} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Task Types</CardTitle>
          <CardDescription>List of all configurable task types and their unit prices.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading task types...</p>
          ) : taskTypes.length > 0 ? (
            <div className="space-y-3">
              {taskTypes.map(task => (
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold font-headline">{task.name}</h3>
                    <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${task.unit_price.toFixed(2)} / unit</p>
                    <div className="mt-1 space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                       <Button variant="destructive" size="sm" disabled>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No task types defined. Add task types to proceed.</p>
          )}
        </CardContent>
      </Card>
       <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          Task type creation is now available. Editing and deletion functionalities will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
