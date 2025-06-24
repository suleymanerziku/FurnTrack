
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Lock } from "lucide-react";

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [isSavingInfo, setIsSavingInfo] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  // Mock form state - in a real app, this would come from user data
  const [name, setName] = React.useState("FurnTrack Admin");
  const [email, setEmail] = React.useState("admin@furntrack.com");

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSaveInformation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Profile information updated (mock):", { name, email });
      toast({
        title: "Profile Updated (Mock)",
        description: "Your personal information has been updated.",
      });
      setIsSavingInfo(false);
    }, 1000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
      });
      return;
    }
    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "New password cannot be empty.",
      });
      return;
    }
    setIsSavingPassword(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Password updated (mock)");
      toast({
        title: "Password Updated (Mock)",
        description: "Your password has been successfully changed.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSavingPassword(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><UserCircle className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
          <CardDescription>Update your name, email, and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveInformation} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/80x80.png" alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>FT</AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" disabled>Change Avatar (WIP)</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your full name"
                disabled={isSavingInfo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com"
                disabled={isSavingInfo}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingInfo} className="w-full sm:w-auto">
                {isSavingInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Information
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><Lock className="h-5 w-5 text-primary" /> Security Settings</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isSavingPassword}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingPassword} className="w-full sm:w-auto">
                {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
