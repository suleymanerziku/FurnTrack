
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UserFormInputSchema, type UserFormData, type User, UserRoleSchema } from "@/lib/types";
import { addUser, updateUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import type { Dispatch, SetStateAction } from "react";

interface UserFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: (user: User) => void;
  currentUser?: User | null;
}

export default function UserForm({ setOpen, onSuccess, currentUser }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!currentUser;

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserFormInputSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Staff", // Default role
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (isEditMode && currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        password: "",
        confirmPassword: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "Staff",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser, form, isEditMode]);

  async function onSubmit(values: UserFormData) {
    setIsLoading(true);
    try {
      let result;
      if (isEditMode && currentUser) {
        result = await updateUser(currentUser.id, values);
      } else {
        result = await addUser(values);
      }

      if (result.success && result.user) {
        toast({ title: "Success", description: result.message });
        setOpen(false);
        onSuccess(result.user);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || `Failed to ${isEditMode ? 'update' : 'add'} user.`,
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UserRoleSchema.options.map(roleValue => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {roleValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditMode && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password (min. 6 characters)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm the password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update User" : "Add User"}
        </Button>
      </form>
    </Form>
  );
}
