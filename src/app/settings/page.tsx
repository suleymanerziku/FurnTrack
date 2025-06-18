import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
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
          <CardTitle className="font-headline">General Settings</CardTitle>
          <CardDescription>Manage general application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="USD" disabled>
              <SelectTrigger id="currency" className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="ETB">ETB (Br)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Currency setting is currently disabled.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en" disabled>
              <SelectTrigger id="language" className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Language selection is currently disabled.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="notifications-enabled" disabled />
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
          </div>
           <p className="text-xs text-muted-foreground">Notification settings are currently disabled.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Task Configuration</CardTitle>
          <CardDescription>
            Default settings related to tasks. Task type management is handled on the "Task Types" page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="default-task-deadline">Default Task Deadline (days)</Label>
            <Input id="default-task-deadline" type="number" defaultValue="7" className="w-[180px]" disabled/>
          </div>
          <p className="text-xs text-muted-foreground">This is a placeholder for future task-related settings.</p>
        </CardContent>
      </Card>

      <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent">
        <h3 className="font-headline text-lg font-semibold mb-2 text-accent-foreground/80">Feature Placeholder</h3>
        <p className="text-sm text-accent-foreground/70">
          This settings page will be expanded to include functional controls for currency, language (if multi-language support is added), notification preferences, and other system-wide defaults.
        </p>
      </div>
    </div>
  );
}
