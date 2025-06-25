
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, UsersRound, ChevronRight, ClipboardList, UserCog, Briefcase } from "lucide-react"; 

export default function SettingsPage() { 

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Settings</h2> 
        <p className="text-muted-foreground">
          Configure application-wide preferences and defaults.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <SettingsIcon className="h-5 w-5 text-primary"/> General Settings
          </CardTitle>
          <CardDescription>Manage general application settings like currency, language, and notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/general" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Configure General Settings
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <UsersRound className="h-5 w-5 text-primary"/> Administration
          </CardTitle>
          <CardDescription>Manage users, roles, and employees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/settings/users" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <UsersRound className="h-4 w-4" />
                Manage Users
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings/roles" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                 <UserCog className="h-4 w-4" /> 
                 Manage Roles
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
           <Link href="/settings/employees" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                 <Briefcase className="h-4 w-4" /> 
                 Manage Employees
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <ClipboardList className="h-5 w-5 text-primary"/> Production Settings
          </CardTitle>
          <CardDescription>Define and manage task types used in production.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/task-types" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Manage Task Types
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Settings are currently saved locally or use mock data. Full persistence will be implemented in future updates. Employee Management is now fully functional.
        </p>
      </div>
    </div>
  );
}
