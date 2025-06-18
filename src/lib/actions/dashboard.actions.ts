"use server";

import type { FinancialSummary, Employee, ActivityItem } from "@/lib/types";
// import { supabase } from "@/lib/supabaseClient"; // Uncomment when Supabase is fully set up

export async function getFinancialSummaryData(): Promise<FinancialSummary> {
  // Placeholder data
  // In a real app, fetch and calculate from Supabase:
  // const { data: sales, error: salesError } = await supabase.from('sales').select('amount');
  // const { data: expenses, error: expensesError } = await supabase.from('expenses').select('amount');
  // Calculate total_income, total_expenses, net_income
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return {
    total_income: 125000.75,
    total_expenses: 45000.50,
    net_income: 80000.25,
  };
}

export async function getEmployeeBalancesData(): Promise<Employee[]> {
  // Placeholder data
  // In a real app, fetch from Supabase 'employees' table and calculate balances
  // This might involve joining with 'assigned_tasks' and 'payments'
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    { id: "1", name: "Alice Wonderland", address: "123 Rabbit Hole", contact_info: "555-ALICE", role: "Carpenter", start_date: "2023-01-15", created_at: new Date().toISOString(), pending_balance: 1250.75 },
    { id: "2", name: "Bob The Builder", address: "456 Fixit Lane", contact_info: "555-BOB", role: "Painter", start_date: "2022-11-01", created_at: new Date().toISOString(), pending_balance: -200.00 },
    { id: "3", name: "Charlie Chaplin", address: "789 Comedy Ave", contact_info: "555-CHARLIE", role: "Assembler", start_date: "2023-03-10", created_at: new Date().toISOString(), pending_balance: 850.00 },
    { id: "4", name: "Diana Prince", address: "Themyscira", contact_info: "555-DIANA", role: "Finisher", start_date: "2023-05-20", created_at: new Date().toISOString(), pending_balance: 1500.50 },
  ];
}

export async function getRecentActivitiesData(): Promise<ActivityItem[]> {
  // Placeholder data
  // In a real app, fetch from multiple tables (sales, expenses, assigned_tasks, payments)
  // Order by created_at DESC and limit the results
  await new Promise(resolve => setTimeout(resolve, 200));
  const now = new Date();
  return [
    { type: "sale", id: "s1", product_name: "Ergonomic Office Chair", amount: 299.99, date: new Date(now.setDate(now.getDate() - 1)).toISOString(), created_at: new Date(now.setDate(now.getDate() - 1)).toISOString() },
    { type: "expense", id: "e1", description: "Premium Oak Wood", amount: 1200.00, date: new Date(now.setDate(now.getDate() - 2)).toISOString(), created_at: new Date(now.setDate(now.getDate() - 2)).toISOString() },
    { type: "task", id: "t1", employee_id: "1", task_type_id: "tt1", quantity_completed: 10, date_assigned: new Date(now.setDate(now.getDate() - 1)).toISOString(), total_payment: 500, created_at: new Date(now.setDate(now.getDate() - 1)).toISOString(), employee_name: "Alice Wonderland", task_name: "Table Leg Sanding" },
    { type: "payment", id: "p1", employee_id: "2", amount: 500.00, payment_type: "Advance", date: new Date(now.setDate(now.getDate() - 3)).toISOString(), created_at: new Date(now.setDate(now.getDate() - 3)).toISOString(), employee_name: "Bob The Builder" },
    { type: "sale", id: "s2", product_name: "Bookshelf, Walnut", amount: 149.50, date: new Date(now.setDate(now.getDate() - 4)).toISOString(), created_at: new Date(now.setDate(now.getDate() - 4)).toISOString() },
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
