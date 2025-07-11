
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EmployeeFormInputSchema, type EmployeeFormData, type Role, type Employee } from "@/lib/types";
import { addEmployee, updateEmployee } from "@/lib/actions/employee.actions";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  roles: Role[];
  currentEmployee?: Employee | null;
  onSuccess?: () => void; // Optional: for actions after successful submit if not redirecting
}

export default function EmployeeForm({ roles, currentEmployee, onSuccess }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!currentEmployee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeFormInputSchema),
    defaultValues: {
      name: "",
      address: "",
      contact_info: "",
      role: "",
      start_date: new Date(),
    },
  });

  React.useEffect(() => {
    if (isEditMode && currentEmployee) {
      form.reset({
        name: currentEmployee.name,
        address: currentEmployee.address || "",
        contact_info: currentEmployee.contact_info || "",
        role: currentEmployee.role || "",
        start_date: new Date(currentEmployee.start_date), // Ensure date is a Date object
      });
    } else {
      form.reset({ // Reset to defaults if not editing or currentEmployee is null
        name: "",
        address: "",
        contact_info: "",
        role: "",
        start_date: new Date(),
      });
    }
  }, [currentEmployee, form, isEditMode]);


  async function onSubmit(values: EmployeeFormData) {
    setIsLoading(true);
    try {
      let result;
      if (isEditMode && currentEmployee) {
        result = await updateEmployee(currentEmployee.id, values);
      } else {
        result = await addEmployee(values);
      }

      if (result.success) {
        toast({ title: "Success", description: result.message });
        form.reset();
        if (onSuccess) {
            onSuccess();
        } else {
            router.push(isEditMode ? `/settings/employees/${currentEmployee?.id}` : "/settings/employees");
        }
        router.refresh(); // Ensure data revalidation on the target page
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || `Failed to ${isEditMode ? 'update' : 'add'} employee.`,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role (Optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.filter(role => role.status === 'Active').map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                  {roles.filter(r => r.status === 'Active').length === 0 && (
                    <SelectItem value="__NO_ACTIVE_ROLES_PLACEHOLDER__" disabled>
                      No active roles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 123 Main St, Anytown, USA"
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
          name="contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., (555) 123-4567 or email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
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
                        format(new Date(field.value), "PPP") // Ensure value is date object for format
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
          {isEditMode ? "Update Employee" : "Add Employee"}
        </Button>
      </form>
    </Form>
  );
}
