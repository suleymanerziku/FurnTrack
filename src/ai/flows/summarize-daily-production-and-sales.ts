'use server';

/**
 * @fileOverview Summarizes daily production and sales data with key insights.
 *
 * - summarizeDailyProductionAndSales - A function that handles the summarization process.
 * - SummarizeDailyProductionAndSalesInput - The input type for the summarizeDailyProductionAndSales function.
 * - SummarizeDailyProductionAndSalesOutput - The return type for the summarizeDailyProductionAndSales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyProductionAndSalesInputSchema = z.object({
  productionData: z.string().describe('Daily production data including tasks completed and quantities.'),
  salesData: z.string().describe('Daily sales data including product, amount, and date.'),
});
export type SummarizeDailyProductionAndSalesInput = z.infer<typeof SummarizeDailyProductionAndSalesInputSchema>;

const SummarizeDailyProductionAndSalesOutputSchema = z.object({
  summary: z.string().describe('A summary of the daily production and sales data with key insights.'),
});
export type SummarizeDailyProductionAndSalesOutput = z.infer<typeof SummarizeDailyProductionAndSalesOutputSchema>;

export async function summarizeDailyProductionAndSales(input: SummarizeDailyProductionAndSalesInput): Promise<SummarizeDailyProductionAndSalesOutput> {
  return summarizeDailyProductionAndSalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyProductionAndSalesPrompt',
  input: {schema: SummarizeDailyProductionAndSalesInputSchema},
  output: {schema: SummarizeDailyProductionAndSalesOutputSchema},
  prompt: `You are an AI assistant helping a furniture manufacturing company manager understand the day's performance.

  Summarize the daily production and sales data provided below, highlighting key insights and trends. Focus on identifying top-performing tasks, sales drivers, and any potential issues.

  Production Data: {{{productionData}}}
  Sales Data: {{{salesData}}}

  Summary:`,
});

const summarizeDailyProductionAndSalesFlow = ai.defineFlow(
  {
    name: 'summarizeDailyProductionAndSalesFlow',
    inputSchema: SummarizeDailyProductionAndSalesInputSchema,
    outputSchema: SummarizeDailyProductionAndSalesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error("AI prompt did not return a valid output for summarizeDailyProductionAndSalesFlow.");
      throw new Error("AI failed to generate a summary in the expected format.");
    }
    return output;
  }
);
