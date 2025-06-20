
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TaskAssignmentFormInputSchema, type TaskAssignmentFormData, type Employee, type TaskType } from "@/lib/types";
import { assignTask } from "@/lib/actions/task.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface TaskAssignmentFormProps {
  employees: Employee[];
  taskTypes: TaskType[];
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
}

export default function TaskAssignmentForm({ employees, taskTypes, setOpen, onSuccess }: TaskAssignmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TaskAssignmentFormData>({
    resolver: zodResolver(TaskAssignmentFormInputSchema),
    defaultValues: {
      employee_id: "",
      date_assigned: new Date(),
      tasks: [{ task_type_id: "", quantity_completed: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  async function onSubmit(values: TaskAssignmentFormData) {
    setIsLoading(true);
    try {
      const tasksToSubmit = values.tasks.filter(task => task.quantity_completed !== null && task.quantity_completed > 0);
      if (tasksToSubmit.length === 0) {
        toast({
          variant: "destructive",
          title: "No Tasks to Log",
          description: "Please add at least one task with a valid quantity.",
        });
        setIsLoading(false);
        return;
      }
      
      const result = await assignTask({...values, tasks: tasksToSubmit as any[]}); 
      
      if (result.success) {
        toast({ 
            title: "Success", 
            description: result.message
        });
        form.reset({
          employee_id: "",
          date_assigned: new Date(),
          tasks: [{ task_type_id: "", quantity_completed: null }],
        });
        setOpen(false);
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to log work.",
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
      <ScrollArea className="max-h-[70vh] w-full pr-3"> 
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pl-1 pr-3">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role || 'N/A'})
                      </SelectItem>
                    ))}
                    {employees.length === 0 && <SelectItem value="__NO_EMPLOYEES_PLACEHOLDER__" disabled>No employees available</SelectItem>}
                  </SelectContent>
                </Select>
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

          <div className="space-y-2">
            <FormLabel>Tasks Completed</FormLabel>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-background">
                  <div className="flex-grow space-y-2">
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.task_type_id`}
                      render={({ field: taskField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Task Type</FormLabel>
                          <Select onValueChange={taskField.onChange} defaultValue={taskField.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a task type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {taskTypes.map(task => (
                                <SelectItem key={task.id} value={task.id}>
                                  {task.name} (${task.unit_price.toFixed(2)}/unit)
                                </SelectItem>
                              ))}
                              {taskTypes.length === 0 && <SelectItem value="__NO_TASK_TYPES_PLACEHOLDER__" disabled>No task types</SelectItem>}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.quantity_completed`}
                      render={({ field: qtyField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 5" 
                              {...qtyField} 
                              value={qtyField.value === null ? '' : qtyField.value || ''}
                              onChange={e => qtyField.onChange(parseInt(e.target.value, 10) || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="shrink-0"
                      aria-label="Remove task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
             <FormMessage>{form.formState.errors.tasks?.root?.message || form.formState.errors.tasks?.message}</FormMessage>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ task_type_id: "", quantity_completed: null })}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Task
          </Button>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || employees.length === 0 || taskTypes.length === 0 || fields.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Work
          </Button>
        </form>
      </ScrollArea>
    </Form>
  );
}
