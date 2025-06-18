
'use server';

import type { TaskTypeFormData, TaskAssignmentFormData } from '@/lib/types';
// import { supabase } from '@/lib/supabaseClient'; // Example for future DB integration
// import { revalidatePath } from 'next/cache';

export async function addTaskType(data: TaskTypeFormData): Promise<{ success: boolean; message: string; taskTypeId?: string }> {
  // Simulate backend processing
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Adding new task type:", {
    name: data.name,
    description: data.description,
    unit_price: data.unit_price,
  });

  // In a real app:
  // const { data: newTaskType, error } = await supabase
  //   .from('task_types')
  //   .insert({
  //     name: data.name,
  //     description: data.description,
  //     unit_price: data.unit_price,
  //   })
  //   .select()
  //   .single();

  // if (error) {
  //   console.error("Error adding task type:", error);
  //   return { success: false, message: error.message };
  // }
  
  // revalidatePath('/task-types');
  // return { success: true, message: "Task type added successfully.", taskTypeId: newTaskType.id };

  const newTaskTypeId = `tt_${Date.now()}`;
  return { success: true, message: "Task type added successfully (mock).", taskTypeId: newTaskTypeId };
}


export async function assignTask(data: TaskAssignmentFormData): Promise<{ success: boolean; message: string; assignmentId?: string }> {
  // Simulate backend processing
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Assigning new task:", {
    employee_id: data.employee_id,
    task_type_id: data.task_type_id,
    quantity: data.quantity,
    date_assigned: data.date_assigned.toISOString().split('T')[0],
  });

  // In a real app, you might also calculate total_payment here if not done on client
  // const { data: taskType } = await supabase.from('task_types').select('unit_price').eq('id', data.task_type_id).single();
  // const total_payment = taskType ? data.quantity * taskType.unit_price : 0;
  //
  // const { data: newAssignment, error } = await supabase
  //   .from('assigned_tasks')
  //   .insert({
  //     employee_id: data.employee_id,
  //     task_type_id: data.task_type_id,
  //     quantity_completed: data.quantity, // Assuming quantity is for completion
  //     date_assigned: data.date_assigned.toISOString().split('T')[0],
  //     total_payment: total_payment, // Store the calculated payment
  //     status: 'Pending', // Default status
  //   })
  //   .select()
  //   .single();

  // if (error) {
  //   console.error("Error assigning task:", error);
  //   return { success: false, message: error.message };
  // }
  
  // revalidatePath('/task-assignments');
  // return { success: true, message: "Task assigned successfully.", assignmentId: newAssignment.id };
  
  const newAssignmentId = `ta_${Date.now()}`;
  return { success: true, message: "Task assigned successfully (mock).", assignmentId: newAssignmentId };
}
