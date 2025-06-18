import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

// Mock function, replace with actual data fetching
async function getEmployees() {
  return [
    { id: "1", name: "Alice Smith", role: "Carpenter", startDate: "2023-01-10", balance: 120.50 },
    { id: "2", name: "Bob Johnson", role: "Painter", startDate: "2022-11-05", balance: -50.00 },
    { id: "3", name: "Charlie Brown", role: "Assembler", startDate: "2023-03-15", balance: 210.75 },
  ];
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Employee Management</h2>
          <p className="text-muted-foreground">
            View, add, and manage employee profiles and payments.
          </p>
        </div>
        <Button asChild>
          <Link href="/employees/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>A list of all employees in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <ul className="space-y-2">
              {employees.map(emp => (
                <li key={emp.id} className="p-4 border rounded-lg shadow-sm hover:bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold font-headline">{emp.name}</h3>
                      <p className="text-sm text-muted-foreground">{emp.role} - Started: {emp.startDate}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${emp.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Balance: ${emp.balance.toFixed(2)}
                      </p>
                      <Button variant="link" size="sm" asChild className="p-0 h-auto">
                        <Link href={`/employees/${emp.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No employees found. Add a new employee to get started.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          Full employee creation, editing, deletion, and detailed views with task performance and payment history will be implemented here.
        </p>
      </div>
    </div>
  );
}
