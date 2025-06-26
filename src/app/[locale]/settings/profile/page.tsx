
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { 
  ProfileInfoFormSchema, 
  type ProfileInfoFormData, 
  ResetPasswordFormSchema, 
  type ResetPasswordFormData 
} from "@/lib/types";
import { updateCurrentUserInfo, updateCurrentUserPassword } from "@/lib/actions/user.actions";

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const user = useUser();
  const router = useRouter();

  const infoForm = useForm<ProfileInfoFormData>({
    resolver: zodResolver(ProfileInfoFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      infoForm.reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, infoForm]);

  const handleSaveInformation = async (data: ProfileInfoFormData) => {
    const result = await updateCurrentUserInfo(data);
    if (result.success) {
      toast({
        title: "Profile Updated",
        description: result.message,
      });
      router.refresh(); // Re-fetch server data to update layout (e.g., sidebar name)
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.message,
      });
    }
  };

  const handleSavePassword = async (data: ResetPasswordFormData) => {
    const result = await updateCurrentUserPassword({ password: data.password });
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    }
  };

  const { isSubmitting: isSavingInfo } = infoForm.formState;
  const { isSubmitting: isSavingPassword } = passwordForm.formState;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <CardDescription>Update your name and email address. Changing your email will require re-verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...infoForm}>
            <form onSubmit={infoForm.handleSubmit(handleSaveInformation)} className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`https://placehold.co/80x80.png?text=${infoForm.getValues('name')?.charAt(0) || 'U'}`} alt="User Avatar" data-ai-hint="user avatar letter" />
                  <AvatarFallback>{infoForm.getValues('name')?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline" disabled>Change Avatar (WIP)</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>
              <FormField
                control={infoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your full name"
                        disabled={isSavingInfo}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={infoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your@email.com"
                        disabled={isSavingInfo}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingInfo} className="w-full sm:w-auto">
                  {isSavingInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Information
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><Lock className="h-5 w-5 text-primary" /> Security Settings</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleSavePassword)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your new password"
                        disabled={isSavingPassword}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your new password"
                        disabled={isSavingPassword}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingPassword} className="w-full sm:w-auto">
                  {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
