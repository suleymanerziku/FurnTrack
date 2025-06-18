
import { z } from 'zod';

export interface Employee {
  id: string; // UUID
  name: string;
  address?: string;
  contact_info?: string;
  role?: string;
  start_date: string; // ISO date string
  created_at: string; // ISO timestamp string
  // For UI calculation:
  pending_balance?: number;
}

export interface TaskType {
  id: string; // UUID
  name: string;
  description?: string;
  unit_price: number;
  created_at: string; // ISO timestamp string
}

export interface AssignedTask {
  id: string; // UUID
  employee_id: string;
  task_type_id: string;
  quantity_completed: number;
  date_assigned: string; // ISO date string
  total_payment: number; // Calculated: quantity_completed * unit_price
  created_at: string; // ISO timestamp string
  // For UI display:
  employee_name?: string;
  task_name?: string;
}

export interface Payment {
  id: string; // UUID
  employee_id: string;
  amount: number;
  payment_type: 'Daily' | 'Partial' | 'Advance' | 'Full';
  date: string; // ISO date string
  created_at: string; // ISO timestamp string
  // For UI display:
  employee_name?: string;
}

export interface Sale {
  id: string; // UUID
  product_name: string;
  amount: number;
  date: string; // ISO date string
  created_at: string; // ISO timestamp string
}

export interface Expense {
  id: string; // UUID
  description: string;
  amount: number;
  date: string; // ISO date string
  created_at: string; // ISO timestamp string
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_income: number;
}

// For AI Insights
export interface AIInsightData {
  productionData: string;
  salesData: string;
}

// For recent activity feed
export type ActivityItem = 
  | ({ type: 'sale' } & Sale)
  | ({ type: 'expense' } & Expense)
  | ({ type: 'task' } & AssignedTask)
  | ({ type: 'payment' } & Payment);

// Finance Form Schemas and Types
export const SaleFormInputSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(100, "Product name can be at most 100 characters."),
  amount: z.coerce.number({invalid_type_error: "Amount must be a number."}).positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required" }),
});
export type SaleFormData = z.infer<typeof SaleFormInputSchema>;

export const ExpenseFormInputSchema = z.object({
  description: z.string().min(1, "Description is required").max(255, "Description can be at most 255 characters."),
  amount: z.coerce.number({invalid_type_error: "Amount must be a number."}).positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required" }),
});
export type ExpenseFormData = z.infer<typeof ExpenseFormInputSchema>;
