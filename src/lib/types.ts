
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
  status?: "Pending" | "In Progress" | "Completed" | "Pending Payment";
}

export interface Payment {
  id: string; // UUID
  employee_id: string;
  amount: number;
  payment_type: 'Daily' | 'Partial' | 'Advance' | 'Full' | 'Withdrawal'; // Added Withdrawal
  date: string; // ISO date string
  created_at: string; // ISO timestamp string
  notes?: string; // Added for withdrawals
  // For UI display:
  employee_name?: string;
}

export interface Sale {
  id: string; // UUID
  product_name: string;
  amount: number;
  date: string; // ISO date string
  receiptNumber?: string;
  created_at: string; // ISO timestamp string
}

export interface Expense {
  id: string; // UUID
  description: string;
  amount: number;
  date: string; // ISO date string
  receiptNumber?: string;
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
  receiptNumber: z.string().max(50, "Receipt number can be at most 50 characters.").optional().or(z.literal('')),
});
export type SaleFormData = z.infer<typeof SaleFormInputSchema>;

export const ExpenseFormInputSchema = z.object({
  description: z.string().min(1, "Description is required").max(255, "Description can be at most 255 characters."),
  amount: z.coerce.number({invalid_type_error: "Amount must be a number."}).positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required" }),
  receiptNumber: z.string().max(50, "Receipt number can be at most 50 characters.").optional().or(z.literal('')),
});
export type ExpenseFormData = z.infer<typeof ExpenseFormInputSchema>;

// Employee Form Schema
export const EmployeeFormInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  address: z.string().max(255).optional().or(z.literal('')),
  contact_info: z.string().max(50, "Contact info can be at most 50 characters.").optional().or(z.literal('')),
  role: z.string().max(50).optional().or(z.literal('')),
  start_date: z.date({ required_error: "Start date is required" }),
});
export type EmployeeFormData = z.infer<typeof EmployeeFormInputSchema>;

// Task Type Form Schema
export const TaskTypeFormInputSchema = z.object({
  name: z.string().min(2, "Task type name must be at least 2 characters.").max(100),
  description: z.string().max(255).optional().or(z.literal('')),
  unit_price: z.coerce.number({invalid_type_error: "Unit price must be a number."}).positive("Unit price must be a positive number."),
});
export type TaskTypeFormData = z.infer<typeof TaskTypeFormInputSchema>;

// Task Assignment (Work Log) Form Schema
export const TaskAssignmentFormInputSchema = z.object({
  employee_id: z.string().min(1, "Employee is required."),
  task_type_id: z.string().min(1, "Task type is required."),
  quantity_completed: z.coerce.number({invalid_type_error: "Quantity must be a number."}).int("Quantity must be an integer.").positive("Quantity must be positive."),
  date_assigned: z.date({ required_error: "Date assigned is required." }),
});
export type TaskAssignmentFormData = z.infer<typeof TaskAssignmentFormInputSchema>;

// Employee Withdrawal Form Schema
export const WithdrawalFormInputSchema = z.object({
  employee_id: z.string().min(1, "Employee is required."),
  amount: z.coerce.number({invalid_type_error: "Amount must be a number."}).positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required." }),
  notes: z.string().max(255, "Notes can be at most 255 characters.").optional().or(z.literal('')),
});
export type WithdrawalFormData = z.infer<typeof WithdrawalFormInputSchema>;
