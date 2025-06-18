"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";
import { SummarizeDailyProductionAndSalesInput } from "@/ai/flows/summarize-daily-production-and-sales"; // Assuming type is exported
import { generateAISummary } from "@/lib/actions/ai.actions"; // Server action
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  productionData: z.string().min(10, "Production data must be at least 10 characters."),
  salesData: z.string().min(10, "Sales data must be at least 10 characters."),
});

type FormData = z.infer<typeof formSchema>;

export default function AIInsightsGenerator() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionData: "",
      salesData: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSummary(null);
    try {
      const inputData: SummarizeDailyProductionAndSalesInput = {
        productionData: data.productionData,
        salesData: data.salesData,
      };
      const result = await generateAISummary(inputData);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        toast({
          variant: "destructive",
          title: "Error Generating Summary",
          description: "The AI could not generate a summary. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="productionData" className="font-semibold">Production Data</Label>
          <Textarea
            id="productionData"
            placeholder="Enter daily production data (e.g., tasks completed, quantities, any issues faced)."
            {...form.register("productionData")}
            className="mt-1 min-h-[100px]"
            aria-invalid={form.formState.errors.productionData ? "true" : "false"}
          />
          {form.formState.errors.productionData && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.productionData.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="salesData" className="font-semibold">Sales Data</Label>
          <Textarea
            id="salesData"
            placeholder="Enter daily sales data (e.g., products sold, amounts, customer feedback, market trends)."
            {...form.register("salesData")}
            className="mt-1 min-h-[100px]"
            aria-invalid={form.formState.errors.salesData ? "true" : "false"}
          />
          {form.formState.errors.salesData && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.salesData.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Summary
            </>
          )}
        </Button>
      </form>

      {summary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-primary">AI Generated Summary</CardTitle>
            <CardDescription>Key insights from your provided data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
