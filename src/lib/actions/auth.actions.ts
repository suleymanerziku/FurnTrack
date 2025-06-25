
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

  // Step 1: Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { // Pass name to be used in email templates if needed
        name: formData.name,
      }
    },
  });

  if (authError) {
    console.error("Sign up error:", authError.message);
    return { error: authError.message };
  }

  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
     return { error: "User may already exist or requires confirmation. Please check your email or try logging in." };
  }

  if (!authData.user) {
      return { error: "User could not be created. Please try again."};
  }

  // Step 2: Create the corresponding user profile in the public.users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name: formData.name,
      email: formData.email,
      role: 'Staff', // Assign a default role for new sign-ups
      status: 'Active',
    });
  
  if (profileError) {
    console.error("Error creating user profile:", profileError);
    // Ideally, you would delete the auth user here to prevent orphaned auth users.
    // This requires an admin client. For now, returning an error is the safest option.
    return { error: `Auth user created, but profile creation failed: ${profileError.message}. Please contact an administrator.` };
  }
  
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
