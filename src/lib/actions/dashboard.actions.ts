
"use server";

import type { FinancialSummary, Employee, ActivityItem } from "@/lib/types";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from '../database.types';

async function calculateEmployeeBalance(employeeId: string, supabase: ReturnType<typeof createServerActionClient<Database>>): Promise<number> {
  let balance = 0;
  const { data: tasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('total_payment')
    .eq('employee_id', employeeId)
    .eq('status', 'Completed');

  if (tasksError) console.error(`Error fetching tasks for balance calculation (employee ${employeeId}):`, tasksError);
  else if (tasks) balance += tasks.reduce((sum, task) => sum + task.total_payment, 0);

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, payment_type')
    .eq('employee_id', employeeId);
  
  if (paymentsError) console.error(`Error fetching payments for balance calculation (employee ${employeeId}):`, paymentsError);
  else if (payments) {
    payments.forEach(payment => {
      if (payment.payment_type === 'Withdrawal' || payment.payment_type === 'Advance') {
        balance -= Math.abs(payment.amount);
      }
    });
  }
  return balance;
}


export async function getFinancialSummaryData(): Promise<FinancialSummary> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  let total_income = 0;
  let total_expenses = 0;

  const { data: sales, error: salesError } = await supabase.from('sales').select('amount');
  if (salesError) console.error("Dashboard: Error fetching sales for summary", salesError);
  else if (sales) total_income = sales.reduce((sum, s) => sum + s.amount, 0);

  const { data: expenses, error: expensesError } = await supabase.from('expenses').select('amount');
  if (expensesError) console.error("Dashboard: Error fetching expenses for summary", expensesError);
  else if (expenses) total_expenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    total_income,
    total_expenses,
    net_income: total_income - total_expenses,
  };
}

export async function getEmployeeBalancesData(): Promise<Employee[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: employees, error } = await supabase
    .from('employees')
    .select('id, name, role, start_date, created_at') 
    .order('name', { ascending: true });

  if (error) {
    console.error("Dashboard: Error fetching employees", error);
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

export async function getRecentActivitiesData(): Promise<ActivityItem[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  const activities: ActivityItem[] = [];
  const limit = 5;

  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (salesError) console.error("Dashboard: Error fetching recent sales", salesError);
  else if (sales) sales.forEach(s => activities.push({ ...s, type: 'sale' }));

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (expensesError) console.error("Dashboard: Error fetching recent expenses", expensesError);
  else if (expenses) expenses.forEach(e => activities.push({ ...e, type: 'expense' }));
  
  const { data: tasks, error: tasksError } = await supabase
    .from('assigned_tasks')
    .select('*, employees(name), task_types(name)')
    .order('created_at', { ascending: false })
    .eq('status', 'Completed')
    .limit(limit);

  if (tasksError) console.error("Dashboard: Error fetching recent tasks", tasksError);
  else if (tasks) {
     (tasks as unknown as Array<Database['public']['Tables']['assigned_tasks']['Row'] & 
        { employees: { name: string } | null; task_types: { name: string } | null }>)
        .forEach(t => activities.push({ 
            ...t, 
            type: 'task', 
            employee_name: t.employees?.name || 'N/A',
            task_name: t.task_types?.name || 'N/A'
        }));
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*, employees(name)')
    .order('created_at', { ascending: false })
    .eq('payment_type', 'Withdrawal')
    .limit(limit);
  
  if (paymentsError) console.error("Dashboard: Error fetching recent payments", paymentsError);
  else if (payments) {
    (payments as unknown as Array<Database['public']['Tables']['payments']['Row'] & 
        { employees: { name: string } | null }>)
        .forEach(p => activities.push({ 
            ...p, 
            type: 'payment', 
            employee_name: p.employees?.name || 'N/A'
        }));
  }

  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
}
