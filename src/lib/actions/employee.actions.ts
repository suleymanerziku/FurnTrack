
'use server';

import type { EmployeeFormData, PaymentFormData, Employee, EmployeeDetailsPageData, EmployeeTransaction, Payment } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';
import { redirect } from 'next/navigation';

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching employee by ID ${id}:`, error);
    return null;
  }
  return data;
}


export async function addEmployee(data: EmployeeFormData): Promise<{ success: boolean; message: string; employeeId?: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: newEmployee, error } = await supabase
    .from('employees')
    .insert({
      name: data.name,
      address: data.address || null,
      contact_info: data.contact_info || null,
      role: data.role || null,
      start_date: data.start_date.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding employee:", error);
    return { success: false, message: error.message };
  }
  if (!newEmployee) {
    return { success: false, message: "Failed to add employee, no data returned." };
  }

  revalidatePath('/settings/employees');
  revalidatePath('/'); // For dashboard updates
  return { success: true, message: "Employee added successfully.", employeeId: newEmployee.id };
}

export async function updateEmployee(id: string, data: EmployeeFormData): Promise<{ success: boolean; message: string; employee?: Employee }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: updatedEmployee, error } = await supabase
    .from('employees')
    .update({
      name: data.name,
      address: data.address || null,
      contact_info: data.contact_info || null,
      role: data.role || null,
      start_date: typeof data.start_date === 'string' ? data.start_date : data.start_date.toISOString().split('T')[0],
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating employee:", error);
    return { success: false, message: error.message };
  }
  if (!updatedEmployee) {
    return { success: false, message: "Failed to update employee, no data returned." };
  }
  revalidatePath('/settings/employees');
  revalidatePath(`/settings/employees/${id}`);
  revalidatePath(`/settings/employees/${id}/edit`);
  revalidatePath('/'); // For dashboard updates
  return { success: true, message: "Employee updated successfully.", employee: updatedEmployee };
}

export async function deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  // Check for related records
  const { data: assignedTasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('id')
    .eq('employee_id', id)
    .limit(1);

  if (tasksError) {
    console.error("Error checking assigned tasks for employee:", tasksError);
    return { success: false, message: "Could not verify if employee has assigned tasks." };
  }
  if (assignedTasks && assignedTasks.length > 0) {
    return { success: false, message: "Cannot delete employee. They have assigned tasks. Please reassign or delete tasks first." };
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('id')
    .eq('employee_id', id)
    .limit(1);
  
  if (paymentsError) {
    console.error("Error checking payments for employee:", paymentsError);
    return { success: false, message: "Could not verify if employee has payment records." };
  }
  if (payments && payments.length > 0) {
     return { success: false, message: "Cannot delete employee. They have payment records. Please clear payment history first." };
  }


  const { error: deleteError } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (deleteError) {
    console.error("Error deleting employee:", deleteError);
    return { success: false, message: deleteError.message };
  }

  revalidatePath('/settings/employees');
  revalidatePath('/'); // For dashboard updates
  return { success: true, message: "Employee deleted successfully." };
}


export async function recordPayment(data: PaymentFormData): Promise<{ success: boolean; message: string; paymentId?: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: newPayment, error } = await supabase
    .from('payments')
    .insert({
      employee_id: data.employee_id,
      amount: data.amount,
      payment_type: 'Withdrawal', // Internally, this is still a withdrawal from their balance
      date: data.date.toISOString().split('T')[0],
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording payment:", error);
    return { success: false, message: error.message };
  }
  if (!newPayment) {
    return { success: false, message: "Failed to record payment, no data returned." };
  }
  
  revalidatePath('/work-log');
  revalidatePath('/settings/employees'); 
  revalidatePath(`/settings/employees/${data.employee_id}`);
  revalidatePath('/'); // For dashboard updates
  return { success: true, message: "Payment recorded successfully.", paymentId: newPayment.id };
}

export async function updatePayment(id: string, data: PaymentFormData): Promise<{ success: boolean; message: string; payment?: Payment }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: originalPayment, error: fetchError } = await supabase
    .from('payments')
    .select('created_at')
    .eq('id', id)
    .single();

  if (fetchError || !originalPayment) {
    return { success: false, message: "Payment record not found." };
  }

  const recordAge = new Date().getTime() - new Date(originalPayment.created_at).getTime();
  if (recordAge > SIX_HOURS_IN_MS) {
    return { success: false, message: "Record is older than 6 hours and can no longer be edited." };
  }

  const { data: updatedPayment, error: updateError } = await supabase
    .from('payments')
    .update({
      employee_id: data.employee_id,
      amount: data.amount,
      date: data.date.toISOString().split('T')[0],
      notes: data.notes || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating payment:", updateError);
    return { success: false, message: updateError.message };
  }
  if (!updatedPayment) {
    return { success: false, message: "Failed to update payment, no data returned." };
  }

  revalidatePath('/work-log');
  revalidatePath('/settings/employees');
  revalidatePath(`/settings/employees/${data.employee_id}`);
  revalidatePath('/');
  return { success: true, message: "Payment updated successfully.", payment: updatedPayment as Payment };
}


async function calculateEmployeeBalance(employeeId: string, supabase: ReturnType<typeof createServerActionClient<Database>>): Promise<number> {
  let balance = 0;

  const { data: tasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('total_payment')
    .eq('employee_id', employeeId)
    .eq('status', 'Completed');

  if (tasksError) {
    console.error(`Error fetching tasks for employee ${employeeId}:`, tasksError);
  } else if (tasks) {
    balance += tasks.reduce((sum, task) => sum + task.total_payment, 0);
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, payment_type')
    .eq('employee_id', employeeId);

  if (paymentsError) {
    console.error(`Error fetching payments for employee ${employeeId}:`, paymentsError);
  } else if (payments) {
    payments.forEach(payment => {
      if (payment.payment_type === 'Withdrawal' || payment.payment_type === 'Advance') {
        balance -= Math.abs(payment.amount);
      }
    });
  }
  return balance;
}

export async function getEmployeeDetailsPageData(employeeId: string): Promise<EmployeeDetailsPageData> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (empError || !employee) {
    if (empError && empError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching employee details:", empError);
    }
    return { employee: null, transactions: [], currentBalance: 0 };
  }

  const transactions: EmployeeTransaction[] = [];

  const { data: tasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('id, date_assigned, total_payment, quantity_completed, task_types(name)')
    .eq('employee_id', employeeId);

  if (tasksError) console.error("Error fetching tasks:", tasksError);
  else {
    (tasks as unknown as Array<Database['public']['Tables']['assigned_tasks']['Row'] & { task_types: { name: string } | null }>).forEach(task => {
      transactions.push({
        id: task.id,
        date: task.date_assigned,
        description: `Work Logged: ${task.task_types?.name || 'Unknown Task'} (Qty: ${task.quantity_completed})`,
        amount: task.total_payment,
        type: 'Work Logged',
        runningBalance: 0 
      });
    });
  }

  const { data: withdrawals, error: wdError } = await supabase
    .from('payments')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('payment_type', 'Withdrawal');
  
  if (wdError) console.error("Error fetching withdrawals:", wdError);
  else {
    withdrawals.forEach(wd => {
      transactions.push({
        id: wd.id,
        date: wd.date,
        description: `Payment: ${wd.notes || 'N/A'}`,
        amount: -Math.abs(wd.amount),
        type: 'Payment',
        runningBalance: 0
      });
    });
  }

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const finalizedTransactions = transactions.map(tx => {
    runningBalance += tx.amount;
    return { ...tx, runningBalance };
  });
  
  return {
    employee: employee as Employee,
    transactions: finalizedTransactions,
    currentBalance: runningBalance
  };
}

export async function getEmployeesWithBalances(): Promise<Employee[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
  if (!employees) return [];

  const employeesWithBalances = await Promise.all(
    employees.map(async (emp) => {
      const balance = await calculateEmployeeBalance(emp.id, supabase);
      return { ...emp, pending_balance: balance } as Employee;
    })
  );

  return employeesWithBalances;
}

export async function getBasicEmployees(): Promise<Pick<Employee, 'id' | 'name' | 'role'>[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
   const { data, error } = await supabase
    .from('employees')
    .select('id, name, role')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching basic employees:", error);
    return [];
  }
  return data || [];
}

export async function getRecentPayments(limit = 10): Promise<Payment[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      employees ( name )
    `)
    .eq('payment_type', 'Withdrawal')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent payments:", error);
    return [];
  }
  if (!data) return [];
  
  return data.map(item => ({
    ...item,
    employee_name: (item.employees as unknown as {name: string} | null)?.name || 'Unknown Employee',
  })) as Payment[];
}
