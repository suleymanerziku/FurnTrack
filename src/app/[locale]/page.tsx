
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FinancialSummaryCard from "@/components/dashboard/FinancialSummaryCard";
import EmployeeBalancesCard from "@/components/dashboard/EmployeeBalancesCard";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { getFinancialSummaryData, getEmployeeBalancesData, getRecentActivitiesData } from "@/lib/actions/dashboard.actions";
import type { FinancialSummary, Employee, ActivityItem } from "@/lib/types";

export default async function DashboardPage() {
  // Fetch data in parallel
  const [financialSummary, employeeBalances, recentActivities] = await Promise.all([
    getFinancialSummaryData(),
    getEmployeeBalancesData(),
    getRecentActivitiesData()
  ]);

  return (
    <div className="grid gap-6 max-w-7xl mx-auto">
      {/* Row 1: Financials, Employee Balances */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinancialSummaryCard summary={financialSummary} />
        <EmployeeBalancesCard employees={employeeBalances} />
      </div>

      {/* Row 2: Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivityFeed activities={recentActivities} />
      </div>

    </div>
  );
}
