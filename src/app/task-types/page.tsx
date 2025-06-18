import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Assuming navigation to a form page
import { PlusCircle, Edit, Trash2 } from "lucide-react";

// Mock function, replace with actual data fetching
async function getTaskTypes() {
  return [
    { id: "1", name: "Chair Making", description: "Crafting standard wooden chairs", unitPrice: 50.00 },
    { id: "2", name: "Table Assembly", description: "Assembling dining tables", unitPrice: 75.00 },
    { id: "3", name: "Painting - Small Item", description: "Painting small furniture items", unitPrice: 20.00 },
  ];
}

export default async function TaskTypesPage() {
  const taskTypes = await getTaskTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Task Type Management</h2>
          <p className="text-muted-foreground">
            Define and manage different types of tasks performed in production.
          </p>
        </div>
        <Button disabled> {/* onClick should open a modal or navigate to a new page */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Task Types</CardTitle>
          <CardDescription>List of all configurable task types and their unit prices.</CardDescription>
        </CardHeader>
        <CardContent>
          {taskTypes.length > 0 ? (
            <div className="space-y-3">
              {taskTypes.map(task => (
                <div key={task.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold font-headline">{task.name}</h3>
                    <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${task.unitPrice.toFixed(2)} / unit</p>
                    <div className="mt-1 space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                       <Button variant="destructive" size="sm" disabled>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No task types defined. Add task types to proceed.</p>
          )}
        </CardContent>
      </Card>
       <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          Full task type creation, editing, and deletion functionalities will be implemented here, likely using modals or separate form pages.
        </p>
      </div>
    </div>
  );
}
