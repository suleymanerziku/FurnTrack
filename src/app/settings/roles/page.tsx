
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, ArrowLeft, UserCog, ShieldAlert } from "lucide-react"; // Changed UsersCog to UserCog
import RoleForm from "@/components/roles/RoleForm";
import type { Role } from "@/lib/types";
import { getRoles, deleteRole, toggleRoleStatus } from "@/lib/actions/role.actions";
import { useToast } from "@/hooks/use-toast";

export default function RoleManagementPage() {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  
  const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [roleToToggleStatus, setRoleToToggleStatus] = React.useState<Role | null>(null);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = React.useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = React.useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch roles." });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAddForm = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchRoles(); 
  };

  const handleOpenDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteRole(roleToDelete.id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        fetchRoles();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete role." });
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
      setRoleToDelete(null);
    }
  };
  
  const handleOpenToggleDialog = (role: Role) => {
    setRoleToToggleStatus(role);
    setIsConfirmToggleOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!roleToToggleStatus) return;
    setIsTogglingStatus(true);
    try {
      const result = await toggleRoleStatus(roleToToggleStatus.id);
      if (result.success && result.role) {
        toast({ title: "Success", description: result.message });
        fetchRoles(); 
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to toggle role status." });
    } finally {
      setIsTogglingStatus(false);
      setIsConfirmToggleOpen(false);
      setRoleToToggleStatus(null);
    }
  };

  const getStatusBadgeVariant = (status: Role["status"]) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </Button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Role Management</h2>
          <p className="text-muted-foreground">
            Define and manage system roles and their status.
          </p>
        </div>
        <Button onClick={handleOpenAddForm} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingRole(null);
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserCog className="h-5 w-5 text-primary"/>
              {editingRole ? "Edit Role" : "Add New Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? "Update the details for this role." : "Enter the details for the new role. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            setOpen={setIsFormOpen}
            onSuccess={handleFormSuccess}
            currentRole={editingRole}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              "{roleToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmToggleOpen} onOpenChange={setIsConfirmToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline">
              <ShieldAlert className="h-5 w-5 text-primary"/>
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of role "{roleToToggleStatus?.name}"
              to {roleToToggleStatus?.status === "Active" ? '"Inactive"' : '"Active"'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToToggleStatus(null)} disabled={isTogglingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus} disabled={isTogglingStatus} className="bg-primary hover:bg-primary/90">
              {isTogglingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Defined Roles</CardTitle>
          <CardDescription>List of all configurable system roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : roles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground md:hidden max-w-[200px] truncate">{role.description || "No description"}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">{role.description || "No description"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(role.status)}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(role)} aria-label="Edit role">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenToggleDialog(role)} aria-label="Toggle role status">
                          {role.status === "Active" ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-red-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(role)} aria-label="Delete role" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No roles defined.</p>
              <Button onClick={handleOpenAddForm} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
       <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">System Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Roles defined here can be used to categorize users. Actual permission enforcement based on these roles would require further integration with application logic. The "Admin", "Manager", and "Staff" roles currently assignable to users are predefined.
        </p>
      </div>
    </div>
  );
}

    

    