import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ListOrdered, BarChart3, AlertTriangle } from "lucide-react";
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FinancialSummaryCard summary={financialSummary} />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">+{employeeBalances.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently managed employees
            </p>
          </CardContent>
           <CardFooter>
             <Button asChild size="sm" variant="outline">
                <Link href="/employees">View All Employees</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI-Powered Insights</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold font-headline">Daily Summary</div>
            <p className="text-xs text-muted-foreground">
              Get AI-generated summaries of production and sales.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild size="sm">
                <Link href="/ai-insights">Generate Insights</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EmployeeBalancesCard employees={employeeBalances} />
        <RecentActivityFeed activities={recentActivities} />
      </div>

      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Pending Actions</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-destructive/80" /> 
              <span>Review employee payment balances.</span>
            </li>
            <li className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-destructive/80" />
              <span>Approve <strong>3</strong> new task assignments.</span>
            </li>
             <li className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-destructive/80" />
              <span>Process <strong>2</strong> overdue payments.</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
            <Button variant="destructive" size="sm">Address Issues</Button>
        </CardFooter>
      </Card>

    </div>
  );
}
