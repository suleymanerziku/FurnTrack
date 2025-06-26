
'use server';

import type { Role, RoleFormData } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';

export async function getRoles(): Promise<Role[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
  return data || [];
}

export async function addRole(data: RoleFormData): Promise<{ success: boolean; message: string; role?: Role }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  
  const { data: existingRole, error: selectError } = await supabase
    .from('roles')
    .select('id')
    .ilike('name', data.name) 
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("Error checking existing role name:", selectError);
    return { success: false, message: "Database error checking for existing role name." };
  }
  if (existingRole) {
    return { success: false, message: "A role with this name already exists." };
  }
  
  const { data: newRole, error: insertError } = await supabase
    .from('roles')
    .insert({
      name: data.name,
      description: data.description || null,
      status: 'Active', 
      permissions: [], // Default to no permissions
    })
    .select()
    .single();
  
  if (insertError) {
    console.error("Error adding role:", insertError);
    return { success: false, message: insertError.message };
  }
   if (!newRole) {
    return { success: false, message: "Failed to add role, no data returned." };
  }

  revalidatePath('/settings/roles');
  revalidatePath('/settings/authorization');
  return { success: true, message: "Role added successfully.", role: newRole };
}

export async function updateRole(id: string, data: RoleFormData): Promise<{ success: boolean; message: string; role?: Role }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: existingRoleWithName, error: selectError } = await supabase
    .from('roles')
    .select('id')
    .ilike('name', data.name)
    .not('id', 'eq', id)
    .single();
    
  if (selectError && selectError.code !== 'PGRST116') {
    console.error("Error checking existing role name for update:", selectError);
    return { success: false, message: "Database error checking for existing role name." };
  }
  if (existingRoleWithName) {
    return { success: false, message: "Another role with this name already exists." };
  }

  const { data: updatedRole, error } = await supabase
    .from('roles')
    .update({
      name: data.name,
      description: data.description || null,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating role:", error);
    return { success: false, message: error.message };
  }
  if (!updatedRole) {
    return { success: false, message: "Failed to update role, no data returned." };
  }

  revalidatePath('/settings/roles');
  return { success: true, message: "Role updated successfully.", role: updatedRole };
}

export async function deleteRole(id: string): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting role:", error);
    if (error.code === '23503') {
        return { success: false, message: "Cannot delete role as it is currently assigned to users. Please reassign users first." };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/settings/roles');
  return { success: true, message: "Role deleted successfully." };
}

export async function toggleRoleStatus(id: string): Promise<{ success: boolean; message: string; role?: Role }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: currentRole, error: fetchError } = await supabase
    .from('roles')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !currentRole) {
    console.error("Error fetching role for status toggle:", fetchError);
    return { success: false, message: "Role not found." };
  }

  const newStatus = currentRole.status === 'Active' ? 'Inactive' : 'Active';
  
  const { data: updatedRole, error: updateError } = await supabase
    .from('roles')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();
    
  if (updateError) {
    console.error("Error toggling role status:", updateError);
    return { success: false, message: updateError.message };
  }
  if (!updatedRole) {
    return { success: false, message: "Failed to toggle role status, no data returned." };
  }
  
  revalidatePath('/settings/roles');
  return { success: true, message: `Role status toggled to ${newStatus}.`, role: updatedRole };
}

export async function updateRolesPermissions(
  updates: { roleId: string; permissions: string[] }[]
): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  // In a real app, you'd use a transaction here. For simplicity, we'll do it in a loop.
  const errors = [];
  for (const update of updates) {
    const { error } = await supabase
      .from('roles')
      .update({ permissions: update.permissions })
      .eq('id', update.roleId);
    
    if (error) {
      console.error(`Error updating permissions for role ${update.roleId}:`, error);
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    return { success: false, message: `Some permissions failed to update: ${errors.join(', ')}` };
  }

  revalidatePath('/settings/authorization');
  revalidatePath('/[locale]/layout', 'layout'); // Revalidate layout to update sidebar for current user
  
  return { success: true, message: "Permissions updated successfully." };
}
