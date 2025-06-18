
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { TaskTypeFormInputSchema, type TaskTypeFormData } from "@/lib/types";
import { addTaskType } from "@/lib/actions/task.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface TaskTypeFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void; // Callback for successful submission
}

export default function TaskTypeForm({ setOpen, onSuccess }: TaskTypeFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TaskTypeFormData>({
    resolver: zodResolver(TaskTypeFormInputSchema),
    defaultValues: {
      name: "",
      description: "",
      unit_price: null, // Changed from undefined
    },
  });

  async function onSubmit(values: TaskTypeFormData) {
    setIsLoading(true);
    try {
      const result = await addTaskType(values);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        form.reset();
        setOpen(false);
        onSuccess?.(); // Call the success callback
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to add task type.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chair Sanding, Table Assembly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the task type"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} value={field.value === null ? '' : field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Task Type
        </Button>
      </form>
    </Form>
  );
}
