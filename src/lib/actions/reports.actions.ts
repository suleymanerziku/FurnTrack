
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '../database.types';
import { sub, format, parseISO, startOfMonth } from 'date-fns';

type Period = '7d' | '30d' | '90d' | '12m';

export interface ChartDataPoint {
  date: string;
  sales: number;
  production: number;
}

export async function getChartData(period: Period): Promise<ChartDataPoint[]> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  let startDate: Date;

  switch (period) {
    case '12m':
      startDate = sub(new Date(), { months: 11 });
      startDate = startOfMonth(startDate);
      break;
    case '90d':
      startDate = sub(new Date(), { days: 89 });
      break;
    case '30d':
      startDate = sub(new Date(), { days: 29 });
      break;
    case '7d':
    default:
      startDate = sub(new Date(), { days: 6 });
      break;
  }
  
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');

  const [salesResult, productionResult] = await Promise.all([
    supabase.from('sales').select('date, amount').gte('date', formattedStartDate),
    supabase.from('assigned_tasks').select('date_assigned, total_payment').eq('status', 'Completed').gte('date_assigned', formattedStartDate)
  ]);
  
  if (salesResult.error) console.error('Error fetching sales data:', salesResult.error);
  if (productionResult.error) console.error('Error fetching production data:', productionResult.error);

  const salesData = salesResult.data || [];
  const productionData = productionResult.data || [];

  const combinedData: { [key: string]: { sales: number; production: number } } = {};

  const processData = (
    data: { date: string; amount: number }[] | { date_assigned: string; total_payment: number }[],
    type: 'sales' | 'production'
  ) => {
    for (const item of data) {
      const dateStr = 'amount' in item ? item.date : item.date_assigned;
      const value = 'amount' in item ? item.amount : item.total_payment;
      const date = parseISO(dateStr);
      let key: string;

      if (period === '12m') {
        key = format(startOfMonth(date), 'yyyy-MM-dd');
      } else {
        key = format(date, 'yyyy-MM-dd');
      }
      
      if (!combinedData[key]) {
        combinedData[key] = { sales: 0, production: 0 };
      }
      combinedData[key][type] += value;
    }
  };

  processData(salesData, 'sales');
  processData(productionData, 'production');

  const dateMap = new Map<string, { sales: number; production: number }>();
  Object.entries(combinedData).forEach(([date, values]) => {
    dateMap.set(date, values);
  });

  const chartData: ChartDataPoint[] = [];
  let currentDate = startDate;
  const endDate = new Date();

  if (period === '12m') {
    while (currentDate <= endDate) {
      const key = format(currentDate, 'yyyy-MM-dd');
      const dataPoint = dateMap.get(key) || { sales: 0, production: 0 };
      chartData.push({
        date: format(currentDate, 'MMM yyyy'),
        ...dataPoint,
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate = startOfMonth(currentDate);
    }
  } else {
    while (currentDate <= endDate) {
      const key = format(currentDate, 'yyyy-MM-dd');
      const dataPoint = dateMap.get(key) || { sales: 0, production: 0 };
      chartData.push({
        date: format(currentDate, 'd MMM'),
        ...dataPoint,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return chartData;
}
