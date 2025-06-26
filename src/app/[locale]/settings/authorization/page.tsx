
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRoles, updateRolesPermissions } from "@/lib/actions/role.actions";
import type { Role } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// Define the available permissions for the application
const availablePermissions = [
  { id: '/', label: 'Dashboard', description: 'View the main dashboard.' },
  { id: '/finances', label: 'Finances', description: 'Access financial records, sales, and expenses.' },
  { id: '/work-log', label: 'Work & Payment Log', description: 'Log completed tasks and manage employee payments.' },
  { id: '/reports', label: 'Reports', description: 'View and generate performance reports.' },
  { id: '/ai-insights', label: 'AI Insights', description: 'Use AI-powered data analysis.' },
  { id: '/settings/users', label: 'User Management', description: 'Add, edit, and manage system users.' },
  { id: '/settings/roles', label: 'Role Management', description: 'Define and manage system roles.' },
  { id: '/settings/employees', label: 'Employee Management', description: 'Manage employee profiles and details.' },
  { id: '/settings/task-types', label: 'Task Type Management', description: 'Define tasks and their unit prices.' },
  { id: '/settings/authorization', label: 'Authorization Settings', description: 'Manage role-based permissions (this page).' },
];

export default function AuthorizationSettingsPage() {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [permissions, setPermissions] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    async function fetchRolesData() {
      setIsLoading(true);
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
        const initialPermissions: Record<string, string[]> = {};
        for (const role of rolesData) {
          initialPermissions[role.id] = role.permissions || [];
        }
        setPermissions(initialPermissions);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load roles and permissions.",
        });
      }
      setIsLoading(false);
    }
    fetchRolesData();
  }, [toast]);
  
  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setPermissions(prev => {
      const currentPermissions = prev[roleId] || [];
      const newPermissions = checked
        ? [...currentPermissions, permissionId]
        : currentPermissions.filter(p => p !== permissionId);
      return { ...prev, [roleId]: newPermissions };
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const updates = Object.entries(permissions).map(([roleId, perms]) => ({
      roleId,
      permissions: perms,
    }));
    
    const result = await updateRolesPermissions(updates);

    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsSaving(false);
  };
  
  // Base permissions that are always granted and not configurable here.
  const basePermissionsInfo = "All roles have default access to their own Profile and General settings pages.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/settings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Authorization Settings</h2>
          <p className="text-muted-foreground">
            Configure which roles can access which pages of the application.
          </p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoading} size="lg" className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      
      <div className="mt-2 p-4 bg-accent/20 rounded-lg border border-accent">
        <p className="text-sm text-accent-foreground/70">{basePermissionsInfo}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          roles.map(role => (
            <Card key={role.id} className={role.name.toLowerCase() === 'admin' ? 'bg-primary/5 border-primary/20' : ''}>
              <CardHeader>
                <CardTitle className="font-headline">{role.name}</CardTitle>
                <CardDescription>
                  {role.description || `Permissions for the ${role.name} role.`}
                  {role.name.toLowerCase() === 'admin' && " Admins have all permissions by default."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePermissions.map(permission => {
                  const isChecked = role.name.toLowerCase() === 'admin' || permissions[role.id]?.includes(permission.id);
                  const isDisabled = role.name.toLowerCase() === 'admin' || isSaving;

                  return (
                    <div key={permission.id} className="flex items-start gap-3">
                      <Checkbox
                        id={`${role.id}-${permission.id}`}
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={(checked) => handlePermissionChange(role.id, permission.id, !!checked)}
                        aria-label={`${role.name} - ${permission.label}`}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`${role.id}-${permission.id}`}
                          className={`font-medium ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
