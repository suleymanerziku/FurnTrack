
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
import { ForgotPasswordFormSchema, type ForgotPasswordFormData } from "@/lib/types";
import { sendPasswordResetEmailAction } from "@/lib/actions/auth.actions";

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null); // For success/error feedback

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    setIsLoading(true);
    setMessage(null);
    const result = await sendPasswordResetEmailAction(values);

    if (result?.error) {
      setMessage(result.error); // Could be a generic message like "If email exists..."
      toast({
        variant: "destructive", // Or default, depending on how you want to handle "email not found"
        title: "Password Reset",
        description: result.error,
      });
    } else if (result?.success) {
      setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).");
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for instructions to reset your password.",
      });
      form.reset();
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {message && (
          <div className={`p-3 rounded-md text-sm ${form.formState.errors.email || !form.formState.isSubmitSuccessful ? 'bg-destructive/10 border border-destructive/30 text-destructive' : 'bg-green-500/10 border border-green-500/30 text-green-700'}`}>
            {message}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading || !!message && !form.formState.errors.email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading || (!!message && !form.formState.errors.email) }>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
        <div className="text-center text-sm">
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Back to Log In
          </Link>
        </div>
      </form>
    </Form>
  );
}
