
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
import { PlusCircle, Edit, ToggleLeft, ToggleRight, Loader2, UsersRound, ShieldAlert, ArrowLeft } from "lucide-react";
import UserForm from "@/components/users/UserForm";
import type { User } from "@/lib/types";
import { getUsers, toggleUserStatus } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  const [userToToggleStatus, setUserToToggleStatus] = React.useState<User | null>(null);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = React.useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = React.useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch users." });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddForm = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (updatedOrNewUser: User) => {
    // Re-fetch or update local state
    fetchUsers(); 
  };

  const handleOpenToggleDialog = (user: User) => {
    setUserToToggleStatus(user);
    setIsConfirmToggleOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setIsTogglingStatus(true);
    try {
      const result = await toggleUserStatus(userToToggleStatus.id);
      if (result.success && result.user) {
        toast({ title: "Success", description: result.message });
        fetchUsers(); // Re-fetch to update the list
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to toggle user status." });
    } finally {
      setIsTogglingStatus(false);
      setIsConfirmToggleOpen(false);
      setUserToToggleStatus(null);
    }
  };

  const getStatusBadgeVariant = (status: User["status"]) => {
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
          <h2 className="text-2xl font-bold tracking-tight font-headline">User Management</h2>
          <p className="text-muted-foreground">
            Manage system users, their roles, and access status.
          </p>
        </div>
        <Button onClick={handleOpenAddForm} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingUser(null);
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UsersRound className="h-5 w-5 text-primary"/>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the details for this user." : "Enter the details for the new user. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            setOpen={setIsFormOpen}
            onSuccess={handleFormSuccess}
            currentUser={editingUser}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmToggleOpen} onOpenChange={setIsConfirmToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline">
              <ShieldAlert className="h-5 w-5 text-primary"/>
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of user "{userToToggleStatus?.name}"
              to {userToToggleStatus?.status === "Active" ? '"Inactive"' : '"Active"'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToToggleStatus(null)} disabled={isTogglingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus} disabled={isTogglingStatus} className="bg-primary hover:bg-primary/90">
              {isTogglingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Overview of all registered system users.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1 sm:gap-2"> {/* Adjusted gap for smaller screens */}
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(user)} aria-label="Edit user">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenToggleDialog(user)} aria-label="Toggle user status">
                          {user.status === "Active" ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-red-600" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No users found.</p>
              <Button onClick={handleOpenAddForm} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
