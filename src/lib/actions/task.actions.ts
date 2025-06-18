
'use server';

import type { TaskTypeFormData, TaskAssignmentFormData, TaskType } from '@/lib/types';
// import { supabase } from '@/lib/supabaseClient'; // Example for future DB integration
// import { revalidatePath } from 'next/cache';

// Mock task types data for price lookup in assignTask
const MOCK_TASK_TYPES_FOR_ACTIONS: Pick<TaskType, 'id' | 'unit_price'>[] = [
  { id: "tt1", unit_price: 50.00 },
  { id: "tt2", unit_price: 75.00 },
  { id: "tt3", unit_price: 20.00 },
  // Add more mock task types as needed by your forms/tests
];


export async function addTaskType(data: TaskTypeFormData): Promise<{ success: boolean; message: string; taskType?: TaskType }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Adding new task type:", data);

  // Simulate DB insertion and getting the new object back
  const newTaskType: TaskType = {
    id: `tt_${Date.now()}`,
    name: data.name,
    description: data.description,
    unit_price: data.unit_price,
    created_at: new Date().toISOString(),
  };
  
  // revalidatePath('/task-types');
  return { success: true, message: "Task type added successfully (mock).", taskType: newTaskType };
}

export async function updateTaskType(id: string, data: TaskTypeFormData): Promise<{ success: boolean; message: string; taskType?: TaskType }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Updating task type:", id, data);

  // Simulate DB update and getting the updated object back
  const updatedTaskType: TaskType = {
    id: id,
    name: data.name,
    description: data.description,
    unit_price: data.unit_price,
    created_at: new Date().toISOString(), // Should retain original created_at in real DB
  };

  // revalidatePath('/task-types');
  // revalidatePath(`/task-types/${id}`); // If you had a detail page
  return { success: true, message: "Task type updated successfully (mock).", taskType: updatedTaskType };
}

export async function deleteTaskType(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Deleting task type:", id);

  // Simulate DB deletion
  // revalidatePath('/task-types');
  return { success: true, message: "Task type deleted successfully (mock)." };
}


export async function assignTask(data: TaskAssignmentFormData): Promise<{ success: boolean; message: string; assignmentId?: string; totalPayment?: number }> {
  // Simulate backend processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const taskTypeDetails = MOCK_TASK_TYPES_FOR_ACTIONS.find(tt => tt.id === data.task_type_id);
  let totalPayment = 0;

  if (taskTypeDetails) {
    totalPayment = taskTypeDetails.unit_price * data.quantity_completed;
  } else {
    console.warn(`Task type ID ${data.task_type_id} not found for payment calculation. Defaulting payment to 0.`);
  }

  console.log("Logging new work (task assignment):", {
    employee_id: data.employee_id,
    task_type_id: data.task_type_id,
    quantity_completed: data.quantity_completed,
    date_assigned: data.date_assigned.toISOString().split('T')[0],
    calculated_total_payment: totalPayment,
    status: "Completed" // Assuming immediate completion
  });
  
  // In a real app, you would:
  // 1. Insert into 'assigned_tasks' table with total_payment and status 'Completed'.
  // 2. Update employee's balance in 'employees' table: employee.balance += totalPayment.
  // revalidatePath('/work-log');
  // revalidatePath('/employees'); // If balances are shown there.

  console.log(`LOG: Employee ${data.employee_id} earned ${totalPayment}. Balance should be updated.`);
  
  const newAssignmentId = `ta_${Date.now()}`;
  return { success: true, message: "Work logged successfully and payment calculated (mock).", assignmentId: newAssignmentId, totalPayment };
}

