
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, ArrowLeft } from "lucide-react"; 
import { useScopedI18n, useChangeLocale, useCurrentLocale } from "@/locales/client";
import type { locales } from "@/locales/i18n";

type Locale = (typeof locales)[number];

export default function GeneralSettingsPage() { 
  const t = useScopedI18n('settings_general');
  const langT = useScopedI18n('language_switcher');
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  
  const [currency, setCurrency] = React.useState("USD");
  const [language, setLanguage] = React.useState<Locale>(currentLocale);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const { toast } = useToast();

  const handleSaveChanges = () => {
    changeLocale(language);
    console.log("General settings saved:", { currency, language, notificationsEnabled });
    toast({
      title: "Settings Updated (Mock)",
      description: "Your general preferences have been updated locally.",
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </Button>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{t('title')}</h2> 
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <SettingsIcon className="h-5 w-5 text-primary"/> Application Preferences
          </CardTitle>
          <CardDescription>Configure your preferred currency, language, and notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="ETB">ETB (Br)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t('language_label')}</Label>
            <Select value={language} onValueChange={(value: Locale) => setLanguage(value)}>
              <SelectTrigger id="language" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{langT('en')}</SelectItem>
                <SelectItem value="am">{langT('am')}</SelectItem>
                <SelectItem value="om">{langT('om')}</SelectItem>
                <SelectItem value="ti">{langT('ti')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="notifications-enabled" 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveChanges} className="w-full sm:w-auto">{t('save_button')}</Button>
        </CardFooter>
      </Card>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Settings are currently saved locally for this session. Full persistence will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
