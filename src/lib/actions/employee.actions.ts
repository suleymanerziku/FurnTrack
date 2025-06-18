
'use server';

import type { EmployeeFormData, WithdrawalFormData, Employee, AssignedTask, Payment, EmployeeDetailsPageData, EmployeeTransaction } from '@/lib/types';
// import { supabase } from '@/lib/supabaseClient'; // Example for future DB integration
// import { revalidatePath } from 'next/cache';

// Mock data for demonstration
const MOCK_EMPLOYEES: Employee[] = [
    { id: "1", name: "Alice Smith", role: "Carpenter", start_date: "2023-01-10", created_at: new Date().toISOString(), pending_balance: 0 },
    { id: "2", name: "Bob Johnson", role: "Painter", start_date: "2022-11-05", created_at: new Date().toISOString(), pending_balance: 0 },
    { id: "3", name: "Charlie Brown", role: "Assembler", start_date: "2023-03-15", created_at: new Date().toISOString(), pending_balance: 0 },
];

const MOCK_ASSIGNED_TASKS: AssignedTask[] = [
    { id: "task1", employee_id: "1", task_type_id: "tt1", employeeName: "Alice Smith", task_name: "Chair Making", quantity_completed: 5, date_assigned: "2024-07-20", status: "Completed", total_payment: 250, created_at: "2024-07-20T10:00:00Z" },
    { id: "task2", employee_id: "1", task_type_id: "tt2", employeeName: "Alice Smith", task_name: "Table Sanding", quantity_completed: 2, date_assigned: "2024-07-22", status: "Completed", total_payment: 100, created_at: "2024-07-22T10:00:00Z" },
    { id: "task3", employee_id: "2", task_type_id: "tt3", employeeName: "Bob Johnson", task_name: "Shelf Painting", quantity_completed: 10, date_assigned: "2024-07-21", status: "Completed", total_payment: 200, created_at: "2024-07-21T10:00:00Z" },
];

const MOCK_WITHDRAWALS: Payment[] = [
    { id: "wd1", employee_id: "1", amount: 50, payment_type: "Withdrawal", date: "2024-07-23", created_at: "2024-07-23T14:00:00Z", notes: "Personal expense" },
    { id: "wd2", employee_id: "2", amount: 100, payment_type: "Withdrawal", date: "2024-07-24", created_at: "2024-07-24T11:00:00Z", notes: "Advance" },
];


export async function addEmployee(data: EmployeeFormData): Promise<{ success: boolean; message: string; employeeId?: string }> {
  // Simulate backend processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const newEmployee: Employee = {
    id: `emp_${Date.now()}`,
    name: data.name,
    address: data.address,
    contact_info: data.contact_info,
    role: data.role,
    start_date: data.start_date.toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    pending_balance: 0,
  };
  MOCK_EMPLOYEES.push(newEmployee);
  console.log("Adding new employee:", newEmployee);
  
  // revalidatePath('/employees');
  return { success: true, message: "Employee added successfully (mock).", employeeId: newEmployee.id };
}

export async function recordWithdrawal(data: WithdrawalFormData): Promise<{ success: boolean; message: string; withdrawalId?: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newWithdrawal: Payment = {
    id: `wd_${Date.now()}`,
    employee_id: data.employee_id,
    amount: data.amount,
    payment_type: 'Withdrawal',
    date: data.date.toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    notes: data.notes,
  };
  MOCK_WITHDRAWALS.push(newWithdrawal);
  console.log("Recording withdrawal:", newWithdrawal);

  console.log(`LOG: Employee ${data.employee_id} withdrew ${data.amount}. Balance should be updated.`);
  
  // revalidatePath('/employees'); 
  // revalidatePath(`/employees/${data.employee_id}`);
  return { success: true, message: "Withdrawal recorded successfully (mock).", withdrawalId: newWithdrawal.id };
}

export async function getEmployeeDetailsPageData(employeeId: string): Promise<EmployeeDetailsPageData> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  const employee = MOCK_EMPLOYEES.find(emp => emp.id === employeeId) || null;

  if (!employee) {
    return { employee: null, transactions: [], currentBalance: 0 };
  }

  const employeeTasks = MOCK_ASSIGNED_TASKS.filter(task => task.employee_id === employeeId);
  const employeeWithdrawals = MOCK_WITHDRAWALS.filter(wd => wd.employee_id === employeeId);

  const transactions: EmployeeTransaction[] = [];

  employeeTasks.forEach(task => {
    transactions.push({
      id: task.id,
      date: task.date_assigned,
      description: `Work Logged: ${task.task_name || 'Unknown Task'} (Qty: ${task.quantity_completed})`,
      amount: task.total_payment,
      type: 'Work Logged',
      runningBalance: 0 // Placeholder, will be calculated next
    });
  });

  employeeWithdrawals.forEach(wd => {
    transactions.push({
      id: wd.id,
      date: wd.date,
      description: `Withdrawal: ${wd.notes || 'N/A'}`,
      amount: -Math.abs(wd.amount), // Ensure withdrawal is negative
      type: 'Withdrawal',
      runningBalance: 0 // Placeholder
    });
  });

  // Sort transactions by date (created_at or date_assigned/date)
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const finalizedTransactions = transactions.map(tx => {
    runningBalance += tx.amount;
    return { ...tx, runningBalance };
  });
  
  // Update the mock employee's pending_balance for consistency in this mock setup
  const empIndex = MOCK_EMPLOYEES.findIndex(e => e.id === employeeId);
  if (empIndex !== -1) {
    MOCK_EMPLOYEES[empIndex].pending_balance = runningBalance;
  }


  return {
    employee,
    transactions: finalizedTransactions,
    currentBalance: runningBalance
  };
}
