
'use server';

import type { User, UserFormData, UserRole, UserStatus } from '@/lib/types';
// import { revalidatePath } from 'next/cache'; // Uncomment when using real data

let MOCK_USERS: User[] = [
  { id: 'user1', name: 'Super Admin', email: 'admin@furntrack.com', role: 'Admin', status: 'Active', created_at: new Date(Date.now() - 100000000).toISOString() },
  { id: 'user2', name: 'Manager Mike', email: 'manager.mike@furntrack.com', role: 'Manager', status: 'Active', created_at: new Date(Date.now() - 200000000).toISOString() },
  { id: 'user3', name: 'Staff Sarah', email: 'staff.sarah@furntrack.com', role: 'Staff', status: 'Inactive', created_at: new Date(Date.now() - 50000000).toISOString() },
  { id: 'user4', name: 'Operations Olly', email: 'olly@furntrack.com', role: 'Staff', status: 'Active', created_at: new Date(Date.now() - 300000000).toISOString() },
];

export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return MOCK_USERS.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getUserById(id: string): Promise<User | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_USERS.find(user => user.id === id);
}

export async function addUser(data: UserFormData): Promise<{ success: boolean; message: string; user?: User }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (MOCK_USERS.some(user => user.email === data.email)) {
    return { success: false, message: "User with this email already exists." };
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    status: 'Active', // Default status for new users
    created_at: new Date().toISOString(),
  };
  MOCK_USERS.unshift(newUser); // Add to the beginning for chronological display
  // revalidatePath('/users');
  return { success: true, message: "User added successfully (mock).", user: newUser };
}

export async function updateUser(id: string, data: Partial<UserFormData>): Promise<{ success: boolean; message: string; user?: User }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = MOCK_USERS.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }

  // Check if email is being changed and if the new email already exists for another user
  if (data.email && data.email !== MOCK_USERS[userIndex].email && MOCK_USERS.some(u => u.email === data.email && u.id !== id)) {
    return { success: false, message: "Another user with this email already exists." };
  }
  
  const updatedUser = { ...MOCK_USERS[userIndex], ...data };
  MOCK_USERS[userIndex] = updatedUser;
  // revalidatePath('/users');
  // revalidatePath(`/users/${id}`); // If there was a detail page
  return { success: true, message: "User updated successfully (mock).", user: updatedUser };
}

export async function toggleUserStatus(id: string): Promise<{ success: boolean; message: string; user?: User }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userIndex = MOCK_USERS.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }
  
  MOCK_USERS[userIndex].status = MOCK_USERS[userIndex].status === 'Active' ? 'Inactive' : 'Active';
  // revalidatePath('/users');
  return { success: true, message: `User status toggled to ${MOCK_USERS[userIndex].status} (mock).`, user: MOCK_USERS[userIndex] };
}
