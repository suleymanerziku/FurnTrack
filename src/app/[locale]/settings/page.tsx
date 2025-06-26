
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, UsersRound, ChevronRight, ClipboardList, UserCog, Briefcase, UserCircle } from "lucide-react"; 
import { useI18n } from "@/locales/client";
import { useUser } from "@/contexts/UserContext";

export default function SettingsPage() { 
  const t = useI18n();
  const user = useUser();
  const userRole = user?.role || 'Staff'; // Default to a restricted role

  const canAccessAdminSettings = ['admin', 'manager'].includes(userRole.toLowerCase());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{t('settings_hub_page.title')}</h2> 
        <p className="text-muted-foreground">
          {t('settings_hub_page.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <UserCircle className="h-5 w-5 text-primary"/> {t('settings_hub_page.profile.title')}
          </CardTitle>
          <CardDescription>{t('settings_hub_page.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/profile" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                {t('settings_hub_page.profile.button')}
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <SettingsIcon className="h-5 w-5 text-primary"/> {t('settings_hub_page.general.title')}
          </CardTitle>
          <CardDescription>{t('settings_hub_page.general.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/general" passHref>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                {t('settings_hub_page.general.button')}
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {canAccessAdminSettings && (
          <>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <UsersRound className="h-5 w-5 text-primary"/> {t('settings_hub_page.admin.title')}
                </CardTitle>
                <CardDescription>{t('settings_hub_page.admin.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                <Link href="/settings/users" passHref>
                    <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4" />
                        {t('settings_hub_page.admin.users_button')}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/settings/roles" passHref>
                    <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" /> 
                        {t('settings_hub_page.admin.roles_button')}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/settings/employees" passHref>
                    <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> 
                        {t('settings_hub_page.admin.employees_button')}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ClipboardList className="h-5 w-5 text-primary"/> {t('settings_hub_page.production.title')}
                </CardTitle>
                <CardDescription>{t('settings_hub_page.production.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                <Link href="/settings/task-types" passHref>
                    <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        {t('settings_hub_page.production.button')}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
                </CardContent>
            </Card>
        </>
      )}

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">{t('settings_hub_page.note.title')}</h3>
        <p className="text-sm text-accent-foreground/70">
          {t('settings_hub_page.note.content')}
        </p>
      </div>
    </div>
  );
}
