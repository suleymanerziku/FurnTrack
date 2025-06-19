
"use client";

import * as React from "react";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ResetPasswordFormSchema, type ResetPasswordFormData } from "@/lib/types";
import { updateUserPasswordAction } from "@/lib/actions/auth.actions";
// import { useRouter } from "next/navigation"; // Action handles redirect

export default function ResetPasswordForm() {
  const { toast } = useToast();
  // const router = useRouter(); // Action handles redirect
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormData) {
    setIsLoading(true);
    setServerError(null);
    const result = await updateUserPasswordAction(values);

    if (result?.error) {
      setServerError(result.error);
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: result.error,
      });
      setIsLoading(false);
    } else {
      // Action handles successful redirect to login with a message.
      // No client-side redirect needed here.
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. You will be redirected to log in.",
      });
      // setIsLoading(false); // Page will unmount on redirect
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
            {serverError}
          </div>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your new password" {...field} disabled={isLoading}/>
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
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your new password" {...field} disabled={isLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Set New Password
        </Button>
        <div className="text-center text-sm">
          Remembered your password?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </div>
      </form>
    </Form>
  );
}
