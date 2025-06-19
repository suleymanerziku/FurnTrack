
'use server';

import type { Role, RoleFormData } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function getRoles(): Promise<Role[]> {
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
  const { data: existingRole, error: selectError } = await supabase
    .from('roles')
    .select('id')
    .ilike('name', data.name) // Case-insensitive check for name
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
      status: 'Active', // Default status
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
  return { success: true, message: "Role added successfully.", role: newRole };
}

export async function updateRole(id: string, data: RoleFormData): Promise<{ success: boolean; message: string; role?: Role }> {
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
   // Optional: Check if role is assigned to any users before deleting
  // This would require a query to the 'users' table where role_id (if you add it) matches this id.
  // For now, we'll proceed with direct deletion.

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting role:", error);
    // Handle foreign key constraint if roles are linked to users table and a role is in use.
    // Supabase error code for foreign key violation is typically '23503'
    if (error.code === '23503') {
        return { success: false, message: "Cannot delete role as it is currently assigned to users. Please reassign users first." };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/settings/roles');
  return { success: true, message: "Role deleted successfully." };
}

export async function toggleRoleStatus(id: string): Promise<{ success: boolean; message: string; role?: Role }> {
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
