import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock function, replace with actual data fetching
async function getAssignedTasks() {
  return [
    { id: "1", employeeName: "Alice Smith", taskName: "Chair Making", quantity: 5, date: "2024-07-28", status: "Completed" },
    { id: "2", employeeName: "Bob Johnson", taskName: "Table Assembly", quantity: 2, date: "2024-07-27", status: "In Progress" },
    { id: "3", employeeName: "Alice Smith", taskName: "Painting - Small Item", quantity: 10, date: "2024-07-26", status: "Pending Payment" },
  ];
}

export default async function TaskAssignmentsPage() {
  const assignedTasks = await getAssignedTasks();

  const getStatusBadgeVariant = (status: string) => {
    if (status === "Completed") return "default";
    if (status === "In Progress") return "secondary";
    if (status === "Pending Payment") return "outline";
    return "default";
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Task Assignments</h2>
          <p className="text-muted-foreground">
            Assign tasks to employees and track their completion.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" disabled>
            <ListFilter className="mr-2 h-4 w-4" /> Filter Tasks
          </Button>
          <Button disabled> {/* onClick should open a modal or navigate to a new page */}
            <PlusCircle className="mr-2 h-4 w-4" /> Assign New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Task Assignments</CardTitle>
          <CardDescription>Overview of tasks assigned to employees.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedTasks.length > 0 ? (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-start hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold font-headline">{task.taskName}</h3>
                    <p className="text-sm text-muted-foreground">Assigned to: {task.employeeName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {task.quantity} | Date: {task.date}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks currently assigned.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          This page will feature a form for assigning tasks (selecting employee, task type, quantity) and a filterable list/table of all assigned tasks. Automatic payment calculation will be integrated upon task completion.
        </p>
      </div>
    </div>
  );
}
