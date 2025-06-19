
'use server';

import type { Role, RoleFormData, RoleStatus } from '@/lib/types';
// import { revalidatePath } from 'next/cache'; // Uncomment when using real data

let MOCK_ROLES: Role[] = [
  { id: 'role1', name: 'Administrator', description: 'Full system access.', status: 'Active', created_at: new Date(Date.now() - 100000000).toISOString() },
  { id: 'role2', name: 'Workshop Manager', description: 'Manages production and employee tasks.', status: 'Active', created_at: new Date(Date.now() - 200000000).toISOString() },
  { id: 'role3', name: 'Accountant', description: 'Manages finances and sales records.', status: 'Active', created_at: new Date(Date.now() - 50000000).toISOString() },
  { id: 'role4', name: 'Sales Associate', description: 'Records sales and customer interactions.', status: 'Inactive', created_at: new Date(Date.now() - 300000000).toISOString() },
];

export async function getRoles(): Promise<Role[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return MOCK_ROLES.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addRole(data: RoleFormData): Promise<{ success: boolean; message: string; role?: Role }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (MOCK_ROLES.some(role => role.name.toLowerCase() === data.name.toLowerCase())) {
    return { success: false, message: "A role with this name already exists." };
  }

  const newRole: Role = {
    id: `role_${Date.now()}`,
    name: data.name,
    description: data.description,
    status: 'Active', // Default status for new roles
    created_at: new Date().toISOString(),
  };
  MOCK_ROLES.unshift(newRole); 
  // revalidatePath('/settings/roles');
  return { success: true, message: "Role added successfully (mock).", role: newRole };
}

export async function updateRole(id: string, data: RoleFormData): Promise<{ success: boolean; message: string; role?: Role }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const roleIndex = MOCK_ROLES.findIndex(role => role.id === id);
  if (roleIndex === -1) {
    return { success: false, message: "Role not found." };
  }

  if (MOCK_ROLES.some(r => r.name.toLowerCase() === data.name.toLowerCase() && r.id !== id)) {
    return { success: false, message: "Another role with this name already exists." };
  }
  
  const updatedRole = { ...MOCK_ROLES[roleIndex], ...data };
  MOCK_ROLES[roleIndex] = updatedRole;
  // revalidatePath('/settings/roles');
  return { success: true, message: "Role updated successfully (mock).", role: updatedRole };
}

export async function deleteRole(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Prevent deletion of core roles if necessary (example, though these are custom roles for now)
  // const roleToDelete = MOCK_ROLES.find(r => r.id === id);
  // if (roleToDelete && (roleToDelete.name === "Administrator" || roleToDelete.name === "Super Admin")) {
  //   return { success: false, message: "Cannot delete core system roles (mock)." };
  // }

  MOCK_ROLES = MOCK_ROLES.filter(role => role.id !== id);
  // revalidatePath('/settings/roles');
  return { success: true, message: "Role deleted successfully (mock)." };
}

export async function toggleRoleStatus(id: string): Promise<{ success: boolean; message: string; role?: Role }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const roleIndex = MOCK_ROLES.findIndex(role => role.id === id);
  if (roleIndex === -1) {
    return { success: false, message: "Role not found." };
  }
  
  MOCK_ROLES[roleIndex].status = MOCK_ROLES[roleIndex].status === 'Active' ? 'Inactive' : 'Active';
  // revalidatePath('/settings/roles');
  return { success: true, message: `Role status toggled to ${MOCK_ROLES[roleIndex].status} (mock).`, role: MOCK_ROLES[roleIndex] };
}
