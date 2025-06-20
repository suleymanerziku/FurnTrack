
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
    console.error(\`Error fetching user by ID ${id}:\`, error);
    return null;
  }
  return data;
}

export async function addUser(data: UserFormData): Promise<{ success: boolean; message: string; user?: User }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
    console.error("Error checking existing user:", selectError);
    return { success: false, message: "Database error checking for existing user." };
  }
  if (existingUser) {
    return { success: false, message: "User with this email already exists." };
  }

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'Active', 
    })
    .select()
    .single();
  
  if (insertError) {
    console.error("Error adding user:", insertError);
    return { success: false, message: insertError.message };
  }
  if (!newUser) {
    return { success: false, message: "Failed to add user, no data returned."};
  }

  revalidatePath('/settings/users');
  return { success: true, message: "User added successfully.", user: newUser };
}

export async function updateUser(id: string, data: Partial<UserFormData>): Promise<{ success: boolean; message: string; user?: User }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  if (data.email) {
    const { data: existingUserWithEmail, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
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
    .update({
      name: data.name,
      email: data.email,
      role: data.role,
    })
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
  return { success: true, message: \`User status toggled to ${newStatus}.\`, user: updatedUser };
}
