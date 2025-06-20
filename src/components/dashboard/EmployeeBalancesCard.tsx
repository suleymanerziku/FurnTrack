
"use client";

import type { Employee } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EmployeeBalancesCardProps {
  employees: Employee[];
}

export default function EmployeeBalancesCard({ employees }: EmployeeBalancesCardProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Employee Balances</CardTitle>
        <CardDescription>Overview of pending payments for employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px]">
          <div className="space-y-4">
            {employees.length > 0 ? employees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${employee.name.charAt(0)}`} alt={employee.name} data-ai-hint="letter avatar"/>
                  <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.role || "N/A"}</p>
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  (employee.pending_balance || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatCurrency(employee.pending_balance)}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No employee data available.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href="/settings/employees">Manage Employees</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
