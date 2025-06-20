
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteEmployee } from "@/lib/actions/employee.actions";
import { useRouter } from "next/navigation";

interface EmployeeDeleteButtonProps {
  employeeId: string;
  employeeName: string;
  onDeleteSuccess?: () => void; // Callback for list page refresh
}

export default function EmployeeDeleteButton({ employeeId, employeeName, onDeleteSuccess }: EmployeeDeleteButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteEmployee(employeeId);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsConfirmDeleteOpen(false);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          // If not on list page (e.g. detail page), redirect
          router.push("/settings/employees");
          router.refresh();
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete employee." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="default">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the employee
            "{employeeName}". Related data might be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
