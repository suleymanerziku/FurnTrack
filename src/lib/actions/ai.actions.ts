"use server";

import { 
  summarizeDailyProductionAndSales,
  type SummarizeDailyProductionAndSalesInput,
  type SummarizeDailyProductionAndSalesOutput 
} from '@/ai/flows/summarize-daily-production-and-sales';

export async function generateAISummary(
  input: SummarizeDailyProductionAndSalesInput
): Promise<SummarizeDailyProductionAndSalesOutput> {
  try {
    const result = await summarizeDailyProductionAndSales(input);
    return result;
  } catch (error) {
    console.error("Error in generateAISummary server action:", error);
    // Consider more specific error handling or re-throwing a custom error
    throw new Error("Failed to generate AI summary.");
  }
}
