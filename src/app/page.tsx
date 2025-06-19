
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import FinancialSummaryCard from "@/components/dashboard/FinancialSummaryCard";
import EmployeeBalancesCard from "@/components/dashboard/EmployeeBalancesCard";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data fetching functions (replace with actual server actions)
async function getFinancialSummary() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { total_income: 125000, total_expenses: 45000, net_income: 80000 };
}

async function getEmployeeBalances() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: "1", name: "Alice Smith", pending_balance: 1200.50, role: "Carpenter" },
    { id: "2", name: "Bob Johnson", pending_balance: -200.00, role: "Painter" }, // Negative balance indicates advance
    { id: "3", name: "Charlie Brown", pending_balance: 750.75, role: "Assembler" },
  ];
}

async function getRecentActivities() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: "act1", type: "sale", product_name: "Oak Dining Table", amount: 1200, date: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: "act2", type: "expense", description: "Wood Varnish Purchase", amount: 150, date: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: "act3", type: "task", employee_name: "Alice Smith", task_name: "Chair Assembly", quantity_completed: 5, total_payment: 250, date_assigned: new Date().toISOString(), created_at: new Date().toISOString(), employee_id: "1", task_type_id: "task_type_1" },
    { id: "act4", type: "payment", employee_name: "Bob Johnson", amount: 300, payment_type: "Partial", date: new Date().toISOString(), created_at: new Date().toISOString(), employee_id: "2" },
  ];
}


export default async function DashboardPage() {
  const financialSummary = await getFinancialSummary();
  const employeeBalances = await getEmployeeBalances();
  const recentActivities = await getRecentActivities();

  return (
    <div className="grid gap-6">
      {/* Row 1: Financials, Employee Balances */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
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
