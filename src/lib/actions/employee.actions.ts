
'use server';

import type { EmployeeFormData, WithdrawalFormData, Employee, AssignedTask, Payment, EmployeeDetailsPageData, EmployeeTransaction } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Database } from '../database.types';

export async function addEmployee(data: EmployeeFormData): Promise<{ success: boolean; message: string; employeeId?: string }> {
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

  revalidatePath('/employees');
  return { success: true, message: "Employee added successfully.", employeeId: newEmployee.id };
}

export async function recordWithdrawal(data: WithdrawalFormData): Promise<{ success: boolean; message: string; withdrawalId?: string }> {
  const { data: newWithdrawal, error } = await supabase
    .from('payments')
    .insert({
      employee_id: data.employee_id,
      amount: data.amount,
      payment_type: 'Withdrawal',
      date: data.date.toISOString().split('T')[0],
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording withdrawal:", error);
    return { success: false, message: error.message };
  }
  if (!newWithdrawal) {
    return { success: false, message: "Failed to record withdrawal, no data returned." };
  }
  
  revalidatePath('/employees'); 
  revalidatePath(`/employees/${data.employee_id}`);
  return { success: true, message: "Withdrawal recorded successfully.", withdrawalId: newWithdrawal.id };
}


async function calculateEmployeeBalance(employeeId: string): Promise<number> {
  let balance = 0;

  const { data: tasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('total_payment')
    .eq('employee_id', employeeId)
    .eq('status', 'Completed'); // Only count completed tasks towards earnings

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
      // Assuming 'Withdrawal' and 'Advance' are negative, others positive (though this model only uses Withdrawal as negative)
      if (payment.payment_type === 'Withdrawal' || payment.payment_type === 'Advance') {
        balance -= Math.abs(payment.amount);
      } else {
        // If other payment types were positive, they would be added here.
        // For now, only withdrawals affect balance negatively.
        // Work Logged tasks are the primary source of positive balance.
      }
    });
  }
  return balance;
}

export async function getEmployeeDetailsPageData(employeeId: string): Promise<EmployeeDetailsPageData> {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (empError || !employee) {
    console.error("Error fetching employee details:", empError);
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
        description: `Withdrawal: ${wd.notes || 'N/A'}`,
        amount: -Math.abs(wd.amount),
        type: 'Withdrawal',
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
      const balance = await calculateEmployeeBalance(emp.id);
      return { ...emp, pending_balance: balance } as Employee;
    })
  );

  return employeesWithBalances;
}

export async function getBasicEmployees(): Promise<Pick<Employee, 'id' | 'name' | 'role'>[]> {
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
