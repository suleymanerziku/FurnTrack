
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
import { RoleFormInputSchema, type RoleFormData, type Role } from "@/lib/types";
import { addRole, updateRole } from "@/lib/actions/role.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface RoleFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: (role: Role) => void;
  currentRole?: Role | null;
}

export default function RoleForm({ setOpen, onSuccess, currentRole }: RoleFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!currentRole;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(RoleFormInputSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (isEditMode && currentRole) {
      form.reset({
        name: currentRole.name,
        description: currentRole.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [currentRole, form, isEditMode]);

  async function onSubmit(values: RoleFormData) {
    setIsLoading(true);
    try {
      let result;
      if (isEditMode && currentRole) {
        result = await updateRole(currentRole.id, values);
      } else {
        result = await addRole(values);
      }

      if (result.success && result.role) {
        toast({ title: "Success", description: result.message });
        setOpen(false);
        onSuccess(result.role);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || `Failed to ${isEditMode ? 'update' : 'add'} role.`,
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
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Workshop Supervisor" {...field} />
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
                  placeholder="Briefly describe the role's responsibilities or permissions."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Role" : "Add Role"}
        </Button>
      </form>
    </Form>
  );
}
