
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { getChartData } from "@/lib/actions/reports.actions";
import type { ChartDataPoint } from "@/lib/actions/reports.actions";
import ReportChart from "@/components/reports/ReportChart";
import { exportToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

type Period = '7d' | '30d' | '90d' | '12m';

export default function ReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = React.useState<Period>('30d');
  const [data, setData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getChartData(period);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch report data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load report data.",
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, [period, toast]);

  const handleExport = (exportData: any[], fileName: string) => {
    if (exportData.length === 0) {
      toast({
        variant: "default",
        title: "No Data",
        description: "There is no data to export.",
      });
      return;
    }
    exportToExcel(exportData, fileName);
  };

  const salesData = data.map(d => ({ date: d.date, sales: d.sales.toFixed(2) }));
  const productionData = data.map(d => ({ date: d.date, production: d.production.toFixed(2) }));
  
  const financialSummary = data.reduce(
    (acc, curr) => {
      acc.totalSales += curr.sales;
      acc.totalProductionCost += curr.production;
      return acc;
    },
    { totalSales: 0, totalProductionCost: 0, net: 0 }
  );
  financialSummary.net = financialSummary.totalSales - financialSummary.totalProductionCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Reports</h2>
          <p className="text-muted-foreground">
            Analyze sales, production, and financial performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading report data...</p>
        </div>
      ) : (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Financial Summary</TabsTrigger>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="production">Production Report</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                    <CardDescription>
                        A summary of total sales revenue vs. production costs for the selected period.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 bg-green-500/10 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Sales</p>
                        <p className="text-2xl font-bold font-headline text-green-600 dark:text-green-300">${financialSummary.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Total Production Cost</p>
                        <p className="text-2xl font-bold font-headline text-red-600 dark:text-red-300">${financialSummary.totalProductionCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium text-primary">Net</p>
                        <p className={`text-2xl font-bold font-headline ${financialSummary.net >= 0 ? 'text-primary' : 'text-red-600'}`}>${financialSummary.net.toFixed(2)}</p>
                    </div>
                </CardContent>
             </Card>
             <ReportChart
                data={data}
                title="Sales vs Production Costs"
                description="A visual comparison of revenue and costs over the selected period."
                categoryKey="date"
                dataKeys={[
                    { key: 'sales', color: '1', type: 'bar' },
                    { key: 'production', color: '2', type: 'line' },
                ]}
             />
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
             <div className="flex justify-end">
                <Button variant="outline" onClick={() => handleExport(salesData, "sales_report")}>
                    <Download className="mr-2 h-4 w-4" /> Export to Excel
                </Button>
             </div>
             <ReportChart
                data={data}
                title="Sales Revenue"
                description="Daily sales revenue over the selected period."
                categoryKey="date"
                dataKeys={[{ key: 'sales', color: '1', type: 'bar' }]}
             />
             <Card>
                <CardHeader><CardTitle>Sales Data Table</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Sales ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="text-right">{item.sales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="production" className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => handleExport(productionData, "production_cost_report")}>
                    <Download className="mr-2 h-4 w-4" /> Export to Excel
                </Button>
            </div>
             <ReportChart
                data={data}
                title="Production Costs"
                description="Daily production costs (total payment for completed tasks) over the selected period."
                categoryKey="date"
                dataKeys={[{ key: 'production', color: '2', type: 'bar' }]}
             />
             <Card>
                <CardHeader><CardTitle>Production Data Table</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Production Cost ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productionData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="text-right">{item.production}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
