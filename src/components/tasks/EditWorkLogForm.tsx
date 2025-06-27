
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EditWorkLogFormSchema, type EditWorkLogFormData, type AssignedTask } from "@/lib/types";
import { updateAssignedTask } from "@/lib/actions/task.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface EditWorkLogFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
  task: AssignedTask;
}

export default function EditWorkLogForm({ setOpen, onSuccess, task }: EditWorkLogFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<EditWorkLogFormData>({
    resolver: zodResolver(EditWorkLogFormSchema),
    defaultValues: {
      quantity_completed: task.quantity_completed,
      date_assigned: new Date(task.date_assigned),
    },
  });

  async function onSubmit(values: EditWorkLogFormData) {
    setIsLoading(true);
    try {
      const result = await updateAssignedTask(task.id, values);
      if (result.success) {
        toast({ title: "Success", description: "Work log updated successfully." });
        setOpen(false);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to update work log.",
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
        <div className="p-3 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium">{task.employee_name}</p>
            <p className="text-sm text-muted-foreground">{task.task_name}</p>
        </div>

        <FormField
          control={form.control}
          name="quantity_completed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Completed</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_assigned"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Work</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Work Log
        </Button>
      </form>
    </Form>
  );
}
