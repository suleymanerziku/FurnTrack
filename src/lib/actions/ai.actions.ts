'use server';

import { 
  summarizeDailyProductionAndSales,
  type SummarizeDailyProductionAndSalesInput,
  type SummarizeDailyProductionAndSalesOutput 
} from '@/ai/flows/summarize-daily-production-and-sales';

export async function generateAISummary(
  input: SummarizeDailyProductionAndSalesInput
): Promise<{ summary?: string; error?: string }> {
  try {
    const result: SummarizeDailyProductionAndSalesOutput = await summarizeDailyProductionAndSales(input);
    if (result && result.summary) {
      return { summary: result.summary };
    }
    // This case should ideally be caught by the flow itself if output is not as expected
    return { error: "AI returned an unexpected response." };
  } catch (error) {
    console.error("Error in generateAISummary server action:", error);
    let errorMessage = "Failed to generate AI summary.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}
