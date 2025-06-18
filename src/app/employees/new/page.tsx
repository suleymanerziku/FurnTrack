
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeForm from "@/components/employees/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
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
          <EmployeeForm />
        </CardContent>
      </Card>
    </div>
  );
}
