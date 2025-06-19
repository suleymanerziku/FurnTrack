
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from "@/lib/types";
import type { Database } from "@/lib/database.types";

export async function signInWithPassword(formData: LoginFormData): Promise<{ error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: error.message };
  }

  redirect("/");
}

export async function signUpWithPassword(formData: RegisterFormData): Promise<{ error: string | null, success?: boolean }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL is not set. Email confirmation link might not work.");
    return { error: "Site URL configuration error. Cannot send confirmation email." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return { error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
     // This case might happen if email confirmation is required, but the user already exists but is unconfirmed.
     // Supabase might send a "Confirmation required" email again or a "User already exists" type of error.
     // The specific error message from Supabase should be returned.
     console.warn("Sign up: User may already exist or email confirmation is pending:", data.user);
     return { error: "User may already exist or requires confirmation. Please check your email or try logging in." };
  }

  // If email confirmation is disabled, user is logged in, redirect.
  // If email confirmation is enabled, user needs to confirm.
  // The message to the user should guide them accordingly.
  // For now, we'll return a success message. The UI can then inform the user to check their email.
  return { error: null, success: true };
}

export async function signOutAction() {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function sendPasswordResetEmailAction(formData: ForgotPasswordFormData): Promise<{ error: string | null, success?: boolean }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL is not set. Password reset link might not work.");
    // It's critical for password reset.
    return { error: "Site URL configuration error. Cannot send password reset email." };
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`, // Supabase will append tokens
  });

  if (error) {
    console.error("Send password reset email error:", error.message);
    // Don't reveal if email exists for security reasons
    // return { error: error.message }; 
    return { error: "If an account exists for this email, a password reset link has been sent." , success: true};
  }
  return { error: null, success: true };
}

export async function updateUserPasswordAction(formData: ResetPasswordFormData): Promise<{ error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  // The user should be in a session initiated by the recovery link.
  // This session allows them to update their password.
  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  });

  if (error) {
    console.error("Update user password error:", error.message);
    return { error: error.message };
  }

  // Optionally sign them out and redirect to login after successful password update
  // await supabase.auth.signOut();
  redirect("/auth/login?message=Password updated successfully. Please log in."); 
}
