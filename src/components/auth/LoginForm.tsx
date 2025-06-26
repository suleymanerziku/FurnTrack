
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
import { LoginFormSchema, type LoginFormData } from "@/lib/types";
import { signInWithPassword } from "@/lib/actions/auth.actions";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast({ title: "Notification", description: message });
      router.replace('/auth/login', {scroll: false}); // Remove message from URL
    }
     const error = searchParams.get('error');
    if (error) {
      setServerError(error);
      toast({ variant: "destructive", title: "Error", description: error });
      router.replace('/auth/login', {scroll: false}); // Remove error from URL
    }
  }, [searchParams, toast, router]);


  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormData) {
    setIsLoading(true);
    setServerError(null);
    const redirectedFrom = searchParams.get('redirectedFrom');
    const result = await signInWithPassword(values, redirectedFrom);
    if (result?.error) {
      setServerError(result.error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error,
      });
    }
    // If successful, signInWithPassword action handles redirect, so no client-side redirect needed here.
    // If there was no error, the action would have redirected. If it's still here, it means loading might be stuck.
    // However, typically, the page would unmount on successful redirect.
    setIsLoading(false);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
    </Form>
  );
}
