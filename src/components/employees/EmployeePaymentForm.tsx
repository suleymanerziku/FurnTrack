
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PaymentFormInputSchema, type PaymentFormData, type Employee, type Payment } from "@/lib/types";
import { recordPayment, updatePayment } from "@/lib/actions/employee.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface EmployeePaymentFormProps {
  employees: Employee[];
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
  currentPayment?: Payment | null;
}

export default function EmployeePaymentForm({ employees, setOpen, onSuccess, currentPayment }: EmployeePaymentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!currentPayment;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentFormInputSchema),
    defaultValues: {
      employee_id: "",
      amount: null,
      date: new Date(),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (isEditMode && currentPayment) {
      form.reset({
        employee_id: currentPayment.employee_id,
        amount: currentPayment.amount,
        date: new Date(currentPayment.date),
        notes: currentPayment.notes || "",
      });
    }
  }, [currentPayment, isEditMode, form]);

  async function onSubmit(values: PaymentFormData) {
    setIsLoading(true);
    try {
      const result = isEditMode && currentPayment
        ? await updatePayment(currentPayment.id, values)
        : await recordPayment(values);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || `Failed to ${isEditMode ? 'update' : 'record'} payment.`,
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
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
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
                  {employees.length === 0 && <SelectItem value="" disabled>No employees available</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 100.00" {...field} value={field.value === null ? '' : field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Payment</FormLabel>
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
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Advance for personal reasons"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading || (employees.length === 0 && !isEditMode)}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
