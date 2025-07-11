
'use server';

import type { TaskTypeFormData, TaskAssignmentFormData, TaskType, AssignedTask, TaskEntryData, EditWorkLogFormData } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';
import { format } from 'date-fns';

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

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

export async function assignTask(data: TaskAssignmentFormData): Promise<{ success: boolean; message: string; assignmentIds?: string[] }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  const assignmentIds: string[] = [];
  let allSucceeded = true;
  let errors: string[] = [];

  for (const taskEntry of data.tasks) {
    if (taskEntry.quantity_completed === null || taskEntry.quantity_completed <= 0) {
        errors.push(`Invalid quantity for task type ID ${taskEntry.task_type_id}.`);
        allSucceeded = false;
        continue; 
    }
    
    const { data: taskTypeDetails, error: ttError } = await supabase
      .from('task_types')
      .select('unit_price')
      .eq('id', taskEntry.task_type_id)
      .single();

    if (ttError || !taskTypeDetails) {
      console.error(`Error fetching task type details for ID ${taskEntry.task_type_id}:`, ttError);
      errors.push(`Could not find task type ID ${taskEntry.task_type_id} to calculate payment.`);
      allSucceeded = false;
      continue;
    }
    
    const totalPayment = taskTypeDetails.unit_price * taskEntry.quantity_completed;

    const { data: newAssignment, error: assignmentError } = await supabase
      .from('assigned_tasks')
      .insert({
        employee_id: data.employee_id,
        task_type_id: taskEntry.task_type_id,
        quantity_completed: taskEntry.quantity_completed,
        date_assigned: data.date_assigned.toISOString().split('T')[0],
        total_payment: totalPayment,
        status: "Completed" 
      })
      .select('id')
      .single();
    
    if (assignmentError || !newAssignment) {
      console.error(`Error logging work for task type ID ${taskEntry.task_type_id}:`, assignmentError);
      errors.push(`Failed to log work for task type ID ${taskEntry.task_type_id}: ${assignmentError?.message || 'Unknown error'}`);
      allSucceeded = false;
    } else {
      assignmentIds.push(newAssignment.id);
    }
  }

  if (allSucceeded && assignmentIds.length > 0) {
    revalidatePath('/work-log');
    revalidatePath('/task-assignments'); 
    revalidatePath(`/employees/${data.employee_id}`); 
    revalidatePath('/employees'); 
    revalidatePath('/'); 
    return { success: true, message: `${assignmentIds.length} task(s) logged successfully.`, assignmentIds };
  } else if (assignmentIds.length > 0) {
     // Partial success
    revalidatePath('/work-log');
    revalidatePath('/task-assignments');
    revalidatePath(`/employees/${data.employee_id}`);
    revalidatePath('/employees');
    revalidatePath('/');
    return { success: false, message: `Partially logged work. ${assignmentIds.length} task(s) succeeded. Errors: ${errors.join(', ')}`, assignmentIds};
  } else {
    return { success: false, message: `Failed to log any work. Errors: ${errors.join(', ')}` };
  }
}

export async function updateAssignedTask(id: string, data: EditWorkLogFormData): Promise<{ success: boolean; message: string; }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: originalTask, error: fetchError } = await supabase
    .from('assigned_tasks')
    .select('created_at, task_type_id')
    .eq('id', id)
    .single();

  if (fetchError || !originalTask) {
    return { success: false, message: "Work log record not found." };
  }
  
  const recordAge = new Date().getTime() - new Date(originalTask.created_at).getTime();
  if (recordAge > SIX_HOURS_IN_MS) {
    return { success: false, message: "Record is older than 6 hours and can no longer be edited." };
  }

  const { data: taskType, error: ttError } = await supabase
    .from('task_types')
    .select('unit_price')
    .eq('id', originalTask.task_type_id)
    .single();
    
  if (ttError || !taskType) {
    return { success: false, message: "Could not find task type to recalculate payment." };
  }
  
  const totalPayment = taskType.unit_price * data.quantity_completed;

  const { error: updateError } = await supabase
    .from('assigned_tasks')
    .update({
      quantity_completed: data.quantity_completed,
      date_assigned: data.date_assigned.toISOString().split('T')[0],
      total_payment: totalPayment,
    })
    .eq('id', id);

  if (updateError) {
    console.error("Error updating work log:", updateError);
    return { success: false, message: updateError.message };
  }

  revalidatePath('/work-log');
  revalidatePath('/settings/employees');
  revalidatePath('/');
  return { success: true, message: "Work log updated successfully." };
}

export async function getAssignedTasks(): Promise<AssignedTask[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('assigned_tasks')
    .select(`
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
    `)
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

export async function getLoggedWork(filters?: { employeeId?: string | null, taskTypeId?: string | null, date?: Date | null }): Promise<AssignedTask[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  let query = supabase
    .from('assigned_tasks')
    .select(`
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
    `)
    .eq('status', 'Completed') 
    .order('date_assigned', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }
  if (filters?.taskTypeId) {
    query = query.eq('task_type_id', filters.taskTypeId);
  }
  if (filters?.date) {
    const formattedDate = format(filters.date, 'yyyy-MM-dd');
    query = query.eq('date_assigned', formattedDate);
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
