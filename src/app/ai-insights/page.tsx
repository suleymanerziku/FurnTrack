import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AIInsightsGenerator from "@/components/ai/AIInsightsGenerator";

export default function AiInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">AI-Powered Insights</h2>
        <p className="text-muted-foreground">
          Generate summaries and key insights from your daily production and sales data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Daily Performance Analyzer</CardTitle>
          <CardDescription>
            Input your production and sales data for the day to receive an AI-generated summary.
            This tool helps identify top-performing tasks, sales drivers, and potential issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIInsightsGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
