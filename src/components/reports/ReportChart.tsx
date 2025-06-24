
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, ComposedChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ReportChartProps {
  data: any[];
  title: string;
  description: string;
  dataKeys: { key: string; color: string; type: 'bar' | 'line' }[];
  categoryKey: string;
}

export default function ReportChart({ data, title, description, dataKeys, categoryKey }: ReportChartProps) {
  
  const chartConfig = dataKeys.reduce((acc, { key, color }) => {
    acc[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: `hsl(var(--chart-${color}))`,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map(({ key, color, type }) => {
              if (type === 'bar') {
                return <Bar dataKey={key} fill={`var(--color-${key})`} radius={4} key={key} />;
              }
              if (type === 'line') {
                return <Line type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={false} key={key} />;
              }
              return null;
            })}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
