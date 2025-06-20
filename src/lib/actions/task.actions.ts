
'use server';

import type { TaskTypeFormData, TaskAssignmentFormData, TaskType, AssignedTask } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';

export async function getTaskTypes(): Promise<TaskType[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('task_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching task types:", error);
    return [];
  }
  return data || [];
}

export async function addTaskType(data: TaskTypeFormData): Promise<{ success: boolean; message: string; taskType?: TaskType }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: newTaskType, error } = await supabase
    .from('task_types')
    .insert({
      name: data.name,
      description: data.description || null,
      unit_price: data.unit_price,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding task type:", error);
    return { success: false, message: error.message };
  }
  if (!newTaskType) {
     return { success: false, message: "Failed to add task type, no data returned." };
  }

  revalidatePath('/settings/task-types');
  revalidatePath('/task-assignments');
  revalidatePath('/work-log');
  return { success: true, message: "Task type added successfully.", taskType: newTaskType };
}

export async function updateTaskType(id: string, data: TaskTypeFormData): Promise<{ success: boolean; message: string; taskType?: TaskType }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: updatedTaskType, error } = await supabase
    .from('task_types')
    .update({
      name: data.name,
      description: data.description || null,
      unit_price: data.unit_price,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task type:", error);
    return { success: false, message: error.message };
  }
   if (!updatedTaskType) {
     return { success: false, message: "Failed to update task type, no data returned." };
  }

  revalidatePath('/settings/task-types');
  revalidatePath(`/settings/task-types`);
  revalidatePath('/task-assignments'); 
  revalidatePath('/work-log');
  return { success: true, message: "Task type updated successfully.", taskType: updatedTaskType };
}

export async function deleteTaskType(id: string): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { error } = await supabase
    .from('task_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting task type:", error);
    if (error.code === '23503') { 
        return { success: false, message: "Cannot delete task type as it is currently assigned to one or more tasks. Please reassign or delete those tasks first." };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/settings/task-types');
  revalidatePath('/task-assignments');
  revalidatePath('/work-log');
  return { success: true, message: "Task type deleted successfully." };
}

export async function assignTask(data: TaskAssignmentFormData): Promise<{ success: boolean; message: string; assignmentId?: string; totalPayment?: number }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: taskTypeDetails, error: ttError } = await supabase
    .from('task_types')
    .select('unit_price')
    .eq('id', data.task_type_id)
    .single();

  if (ttError || !taskTypeDetails) {
    console.error("Error fetching task type details for payment calculation:", ttError);
    return { success: false, message: "Could not find task type to calculate payment." };
  }
  
  const totalPayment = taskTypeDetails.unit_price * data.quantity_completed;

  const { data: newAssignment, error: assignmentError } = await supabase
    .from('assigned_tasks')
    .insert({
      employee_id: data.employee_id,
      task_type_id: data.task_type_id,
      quantity_completed: data.quantity_completed,
      date_assigned: data.date_assigned.toISOString().split('T')[0],
      total_payment: totalPayment,
      status: "Completed" 
    })
    .select()
    .single();
  
  if (assignmentError) {
    console.error("Error logging work (assigning task):", assignmentError);
    return { success: false, message: assignmentError.message };
  }
  if (!newAssignment) {
     return { success: false, message: "Failed to log work, no data returned." };
  }

  revalidatePath('/work-log');
  revalidatePath('/task-assignments'); 
  revalidatePath(`/employees/${data.employee_id}`); 
  revalidatePath('/employees'); 
  revalidatePath('/'); 
  
  return { success: true, message: "Work logged successfully and payment calculated.", assignmentId: newAssignment.id, totalPayment };
}

export async function getAssignedTasks(): Promise<AssignedTask[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('assigned_tasks')
    .select(\`
      id,
      employee_id,
      task_type_id,
      quantity_completed,
      date_assigned,
      total_payment,
      status,
      created_at,
      employees ( name ),
      task_types ( name )
    \`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching assigned tasks:", error);
    return [];
  }
  if (!data) return [];
  
  return data.map(item => ({
    ...item,
    employee_name: (item.employees as unknown as {name: string} | null)?.name || 'Unknown Employee',
    task_name: (item.task_types as unknown as {name: string} | null)?.name || 'Unknown Task',
  })) as AssignedTask[];
}

export async function getLoggedWork(filters?: { employeeId?: string | null, taskTypeId?: string | null }): Promise<AssignedTask[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  let query = supabase
    .from('assigned_tasks')
    .select(\`
      id,
      employee_id,
      task_type_id,
      quantity_completed,
      date_assigned,
      total_payment,
      status,
      created_at,
      employees ( name ),
      task_types ( name )
    \`)
    .eq('status', 'Completed') 
    .order('date_assigned', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }
  if (filters?.taskTypeId) {
    query = query.eq('task_type_id', filters.taskTypeId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching logged work:", error);
    return [];
  }
   if (!data) return [];

  return data.map(item => ({
    ...item,
    employee_name: (item.employees as unknown as {name: string} | null)?.name || 'Unknown Employee',
    task_name: (item.task_types as unknown as {name: string} | null)?.name || 'Unknown Task',
  })) as AssignedTask[];
}
