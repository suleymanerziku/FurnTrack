
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AppWindow } from "lucide-react"; // Using a more generic icon for app settings

export default function ApplicationSettingsPage() { // Renamed component for clarity
  const [currency, setCurrency] = React.useState("USD");
  const [language, setLanguage] = React.useState("en");
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const { toast } = useToast();

  const handleSaveChanges = () => {
    console.log("Application Settings saved:", { currency, language, notificationsEnabled });
    toast({
      title: "Application Settings Updated (Mock)",
      description: "Your preferences have been updated locally.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Application Settings</h2>
        <p className="text-muted-foreground">
          Configure application-wide preferences and defaults.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <AppWindow className="h-5 w-5 text-primary"/> General Settings
          </CardTitle>
          <CardDescription>Manage general application settings like currency and language.</CardDescription>
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
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="am">Amharic (Placeholder)</SelectItem>
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
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} className="w-full sm:w-auto">Save Changes</Button>
      </div>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Note</h3>
        <p className="text-sm text-accent-foreground/70">
          Settings are currently saved locally for this session. Full persistence will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
