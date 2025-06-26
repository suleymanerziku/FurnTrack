
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/locales/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// This data is a representation of the hardcoded middleware logic for display purposes.
const rolePermissions = [
  {
    role: "Admin",
    description: "Full access to all pages and settings.",
    permissions: [
      { page: "Dashboard", access: true },
      { page: "Finances", access: true },
      { page: "Work & Payment Log", access: true },
      { page: "Reports", access: true },
      { page: "AI Insights", access: true },
      { page: "All Settings", access: true },
    ],
  },
  {
    role: "Manager",
    description: "Full access to all pages and settings.",
    permissions: [
      { page: "Dashboard", access: true },
      { page: "Finances", access: true },
      { page: "Work & Payment Log", access: true },
      { page: "Reports", access: true },
      { page: "AI Insights", access: true },
      { page: "All Settings", access: true },
    ],
  },
  {
    role: "Finance",
    description: "Access to financial data and personal settings.",
    permissions: [
      { page: "Dashboard", access: true },
      { page: "Finances", access: true },
      { page: "Work & Payment Log", access: false },
      { page: "Reports", access: false },
      { page: "AI Insights", access: false },
      { page: "Settings (Profile & General only)", access: true },
    ],
  },
  {
    role: "Coordinator",
    description: "Access to operational logs and personal settings.",
     permissions: [
      { page: "Dashboard", access: true },
      { page: "Finances", access: false },
      { page: "Work & Payment Log", access: true },
      { page: "Reports", access: false },
      { page: "AI Insights", access: false },
      { page: "Settings (Profile & General only)", access: true },
    ],
  },
   {
    role: "Staff",
    description: "Basic access to view dashboard and personal settings.",
     permissions: [
      { page: "Dashboard", access: true },
      { page: "Finances", access: false },
      { page: "Work & Payment Log", access: false },
      { page: "Reports", access: false },
      { page: "AI Insights", access: false },
      { page: "Settings (Profile & General only)", access: true },
    ],
  },
];

export default function AuthorizationSettingsPage() {
  const t = useI18n();

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('settings_authorization.back_button')}
        </Link>
      </Button>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{t('settings_authorization.title')}</h2>
        <p className="text-muted-foreground">
          {t('settings_authorization.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('settings_authorization.card_title')}
          </CardTitle>
           <CardDescription>
            {t('settings_authorization.card_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {rolePermissions.map((roleInfo) => (
              <AccordionItem value={roleInfo.role} key={roleInfo.role}>
                <AccordionTrigger className="text-lg font-headline hover:no-underline">
                  {roleInfo.role}
                </AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground mb-4">{roleInfo.description}</p>
                    <ul className="space-y-2">
                        {roleInfo.permissions.map(perm => (
                            <li key={perm.page} className="flex items-center gap-3 text-sm">
                                {perm.access ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>{perm.page}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
       <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">{t('settings_authorization.note_title')}</h3>
        <p className="text-sm text-accent-foreground/70">
         {t('settings_authorization.note_content')}
        </p>
      </div>

    </div>
  );
}
