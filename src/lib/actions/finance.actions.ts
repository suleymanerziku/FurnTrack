
'use server';
import type { SaleFormData, ExpenseFormData, Sale, Expense, FinancialSummary } from '@/lib/types';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import type { Database } from '../database.types';

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

export async function recordSale(data: SaleFormData): Promise<{ success: boolean; message: string; saleId?: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: newSale, error } = await supabase
    .from('sales')
    .insert({
      product_name: data.productName,
      amount: data.amount,
      date: data.date.toISOString().split('T')[0],
      receipt_number: data.receiptNumber || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording sale:", error);
    return { success: false, message: error.message };
  }
  if (!newSale) {
    return { success: false, message: "Failed to record sale, no data returned."};
  }

  revalidatePath('/finances');
  revalidatePath('/'); 
  return { success: true, message: "Sale recorded successfully.", saleId: newSale.id };
}

export async function updateSale(id: string, data: SaleFormData): Promise<{ success: boolean; message: string; sale?: Sale }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: originalSale, error: fetchError } = await supabase
    .from('sales')
    .select('created_at')
    .eq('id', id)
    .single();

  if (fetchError || !originalSale) {
    console.error("Error fetching sale for update:", fetchError);
    return { success: false, message: "Sale record not found." };
  }

  const recordAge = new Date().getTime() - new Date(originalSale.created_at).getTime();
  if (recordAge > SIX_HOURS_IN_MS) {
    return { success: false, message: "Record is older than 6 hours and can no longer be edited." };
  }

  const { data: updatedSale, error: updateError } = await supabase
    .from('sales')
    .update({
      product_name: data.productName,
      amount: data.amount,
      date: data.date.toISOString().split('T')[0],
      receipt_number: data.receiptNumber || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating sale:", updateError);
    return { success: false, message: updateError.message };
  }
  
  if (!updatedSale) {
    return { success: false, message: "Failed to update sale, no data returned." };
  }
  
  revalidatePath('/finances');
  revalidatePath('/');
  return { success: true, message: "Sale updated successfully.", sale: updatedSale as Sale };
}

export async function recordExpense(data: ExpenseFormData): Promise<{ success: boolean; message: string; expenseId?: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

   const { data: newExpense, error } = await supabase
    .from('expenses')
    .insert({
      description: data.description,
      amount: data.amount,
      date: data.date.toISOString().split('T')[0],
      receipt_number: data.receiptNumber || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error recording expense:", error);
    return { success: false, message: error.message };
  }
  if (!newExpense) {
    return { success: false, message: "Failed to record expense, no data returned."};
  }

  revalidatePath('/finances');
  revalidatePath('/'); 
  return { success: true, message: "Expense recorded successfully.", expenseId: newExpense.id };
}

export async function updateExpense(id: string, data: ExpenseFormData): Promise<{ success: boolean; message: string; expense?: Expense }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data: originalExpense, error: fetchError } = await supabase
    .from('expenses')
    .select('created_at')
    .eq('id', id)
    .single();
    
  if (fetchError || !originalExpense) {
    console.error("Error fetching expense for update:", fetchError);
    return { success: false, message: "Expense record not found." };
  }
  
  const recordAge = new Date().getTime() - new Date(originalExpense.created_at).getTime();
  if (recordAge > SIX_HOURS_IN_MS) {
    return { success: false, message: "Record is older than 6 hours and can no longer be edited." };
  }

  const { data: updatedExpense, error: updateError } = await supabase
    .from('expenses')
    .update({
      description: data.description,
      amount: data.amount,
      date: data.date.toISOString().split('T')[0],
      receipt_number: data.receiptNumber || null,
    })
    .eq('id', id)
    .select()
    .single();
    
  if (updateError) {
    console.error("Error updating expense:", updateError);
    return { success: false, message: updateError.message };
  }

  if (!updatedExpense) {
    return { success: false, message: "Failed to update expense, no data returned." };
  }

  revalidatePath('/finances');
  revalidatePath('/');
  return { success: true, message: "Expense updated successfully.", expense: updatedExpense as Expense };
}

export async function getSales(): Promise<Sale[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
  return data || [];
}

export async function getExpenses(): Promise<Expense[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
  return data || [];
}

export async function getFinancialSummaryForPeriod(): Promise<FinancialSummary> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });
  let totalRevenue = 0;
  let totalExpenses = 0;

  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('amount');
  
  if (salesError) console.error("Error fetching sales for summary:", salesError);
  else if (sales) totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount');
  
  if (expensesError) console.error("Error fetching expenses for summary:", expensesError);
  else if (expenses) totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return {
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  };
}
