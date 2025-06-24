
'use server';

import type { User, UserFormData } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';

export async function getUsers(): Promise<User[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data || [];
}

export async function getUserById(id: string): Promise<User | null> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching user by ID ${id}:`, error);
    return null;
  }
  return data;
}

export async function addUser(data: UserFormData): Promise<{ success: boolean; message: string; user?: User }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password is required and must be at least 6 characters long." };
  }
  if (data.password !== data.confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL is not set. Email confirmation link might not work.");
    return { success: false, message: "Site URL configuration error. Cannot send confirmation email." };
  }

  // Step 1: Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    return { success: false, message: authError.message };
  }
  if (!authData.user) {
    return { success: false, message: "Auth user was not created successfully." };
  }
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { success: false, message: "User with this email already exists but is not confirmed. A new confirmation email has been sent." };
  }

  // Step 2: Create the corresponding user profile in the public.users table
  const { data: newUserProfile, error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id, // Use the ID from the created auth user
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'Active',
    })
    .select()
    .single();

  if (profileError) {
    console.error("Error creating user profile:", profileError);
    // Ideally, you would delete the auth user here to prevent orphaned auth users.
    // This requires an admin client, which is a larger change.
    return { success: false, message: `Auth user created, but profile creation failed: ${profileError.message}. Please delete the user and try again.` };
  }

  if (!newUserProfile) {
    return { success: false, message: "Failed to create user profile after auth user creation." };
  }

  revalidatePath('/settings/users');
  return { success: true, message: "User created successfully. A confirmation email has been sent to the user.", user: newUserProfile };
}

export async function updateUser(id: string, data: UserFormData): Promise<{ success: boolean; message: string; user?: User }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  // Exclude password fields from the update payload.
  const { password, confirmPassword, ...updateData } = data;

  if (updateData.email) {
    const { data: existingUserWithEmail, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('email', updateData.email)
      .not('id', 'eq', id) 
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error checking existing email for update:", selectError);
      return { success: false, message: "Database error checking for existing email." };
    }
    if (existingUserWithEmail) {
      return { success: false, message: "Another user with this email already exists." };
    }
  }
  
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user:", error);
    return { success: false, message: error.message };
  }
  if (!updatedUser) {
    return { success: false, message: "Failed to update user, no data returned."};
  }

  revalidatePath('/settings/users');
  return { success: true, message: "User updated successfully.", user: updatedUser };
}

export async function toggleUserStatus(id: string): Promise<{ success: boolean; message: string; user?: User }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const currentUser = await getUserById(id); 
  if (!currentUser) {
    return { success: false, message: "User not found." };
  }

  const newStatus = currentUser.status === 'Active' ? 'Inactive' : 'Active';
  
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling user status:", error);
    return { success: false, message: error.message };
  }
   if (!updatedUser) {
    return { success: false, message: "Failed to toggle user status, no data returned."};
  }
  
  revalidatePath('/settings/users');
  return { success: true, message: `User status toggled to ${newStatus}.`, user: updatedUser };
}
