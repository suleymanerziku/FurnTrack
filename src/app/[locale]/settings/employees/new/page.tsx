
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { getRoles } from "@/lib/actions/role.actions";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewEmployeeSettingsPage() {
  const roles: Role[] = await getRoles();

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings/employees">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Link>
      </Button>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Add New Employee</h2>
        <p className="text-muted-foreground">
          Fill in the details to add a new employee to the system.
        </p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Employee Information</CardTitle>
          <CardDescription>
            Please provide the necessary information for the new employee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm roles={roles} />
        </CardContent>
      </Card>
    </div>
  );
}
