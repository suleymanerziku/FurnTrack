
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { getRoles } from "@/lib/actions/role.actions";
import { getEmployeeById } from "@/lib/actions/employee.actions";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditEmployeeSettingsPage({ params }: { params: { id: string } }) {
  const roles: Role[] = await getRoles();
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href={`/settings/employees/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employee Details
        </Link>
      </Button>
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Edit Employee: {employee.name}</h2>
        <p className="text-muted-foreground">
          Update the details for this employee.
        </p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Employee Information</CardTitle>
          <CardDescription>
            Modify the necessary information for the employee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm roles={roles} currentEmployee={employee} />
        </CardContent>
      </Card>
    </div>
  );
}

