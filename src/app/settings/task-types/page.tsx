
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Loader2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import TaskTypeForm from "@/components/tasks/TaskTypeForm";
import type { TaskType } from "@/lib/types";
import { deleteTaskType } from "@/lib/actions/task.actions"; 
import { useToast } from "@/hooks/use-toast";

// Mock function, replace with actual data fetching
async function getTaskTypesData(): Promise<TaskType[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: "1", name: "Chair Making", description: "Crafting standard wooden chairs", unit_price: 50.00, created_at: new Date(Date.now() - 100000000).toISOString() },
    { id: "2", name: "Table Assembly", description: "Assembling dining tables", unit_price: 75.00, created_at: new Date(Date.now() - 200000000).toISOString() },
    { id: "3", name: "Painting - Small Item", description: "Painting small furniture items", unit_price: 20.00, created_at: new Date(Date.now() - 300000000).toISOString() },
  ];
}


export default function TaskTypesSettingsPage() { // Renamed component
  const { toast } = useToast();
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskType | null>(null);
  const [taskToDelete, setTaskToDelete] = React.useState<TaskType | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchTaskTypes = async () => {
    setIsLoading(true);
    const data = await getTaskTypesData(); 
    setTaskTypes(data);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchTaskTypes();
  }, []);

  const handleOpenAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (taskType: TaskType) => {
    setEditingTask(taskType);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (updatedOrNewTaskType: TaskType) => {
    if (editingTask) { 
      setTaskTypes(prevTaskTypes =>
        prevTaskTypes.map(tt => tt.id === updatedOrNewTaskType.id ? updatedOrNewTaskType : tt)
      );
    } else { 
      setTaskTypes(prevTaskTypes => [updatedOrNewTaskType, ...prevTaskTypes]);
    }
    setEditingTask(null); 
  };

  const handleOpenDeleteDialog = (taskType: TaskType) => {
    setTaskToDelete(taskType);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteTaskType(taskToDelete.id); 
      if (result.success) {
        setTaskTypes(prevTaskTypes => prevTaskTypes.filter(tt => tt.id !== taskToDelete.id));
        toast({ title: "Success", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete task type." });
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
      setTaskToDelete(null);
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
          <h2 className="text-2xl font-bold tracking-tight font-headline">Task Type Management</h2>
          <p className="text-muted-foreground">
            Define and manage different types of tasks performed in production.
          </p>
        </div>
        <Button onClick={handleOpenAddForm} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task Type
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingTask(null);
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task Type" : "Add New Task Type"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update the details for this task type." : "Enter the details for the new task type. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <TaskTypeForm
            setOpen={setIsFormOpen}
            onSuccess={handleFormSuccess}
            currentTaskType={editingTask}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task type
              "{taskToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Available Task Types</CardTitle>
          <CardDescription>List of all configurable task types and their unit prices.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : taskTypes.length > 0 ? (
            <div className="space-y-3">
              {taskTypes.map(task => (
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between sm:items-center hover:bg-muted/50">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold font-headline">{task.name}</h3>
                    <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                  </div>
                  <div className="flex flex-col items-stretch sm:items-end gap-2">
                    <p className="font-semibold text-primary text-left sm:text-right">${task.unit_price.toFixed(2)} / unit</p>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditForm(task)} className="w-full sm:w-auto">
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(task)} className="w-full sm:w-auto">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No task types defined.</p>
              <Button onClick={handleOpenAddForm} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Task Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
