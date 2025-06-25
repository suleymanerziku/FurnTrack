
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  LayoutDashboard,
  ListChecks,
  DollarSign,
  Settings as SettingsIcon,
  Wand2,
  MoreHorizontal,
  LogOut,
  Menu,
  LogIn,
  LineChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from '@/lib/actions/auth.actions'; 
import { useToast } from '@/hooks/use-toast';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { LanguageSwitcher } from './LanguageSwitcher';


interface AppLayoutProps {
  children: React.ReactNode;
  user: SupabaseAuthUser | null;
}

// This component contains the main layout and consumes the sidebar context.
function MainLayout({ children, user }: AppLayoutProps) {
    const fullPathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { isMobile, toggleSidebar } = useSidebar(); 
    const t = useI18n();
    const locale = useCurrentLocale();

    const pathname = fullPathname.replace(new RegExp(`^/${locale}`), '') || '/';
    
    const navigationItems: NavItem[] = [
      { href: '/', label: t('navigation.dashboard'), icon: LayoutDashboard },
      { href: '/finances', label: t('navigation.finances'), icon: DollarSign },
      { href: '/work-log', label: t('navigation.work_log'), icon: ListChecks },
      { href: '/reports', label: t('navigation.reports'), icon: LineChart },
      { href: '/ai-insights', label: t('navigation.ai_insights'), icon: Wand2 },
    ];

    const getPageTitle = () => {
        if (pathname === '/settings') return t('navigation.settings');
        if (pathname === '/settings/users') return "User Management";
        if (pathname === '/settings/profile') return "Profile Settings";
        if (pathname === '/settings/task-types') return "Task Type Management";
        if (pathname === '/settings/roles') return "Role Management"; 
        if (pathname === '/settings/employees') return "Employee Management";
        if (pathname.startsWith('/settings/employees/new')) return "Add New Employee";
        if (pathname.match(/^\/settings\/employees\/[^/]+\/edit$/)) return "Edit Employee";
        if (pathname.match(/^\/settings\/employees\/[^/]+$/)) return "Employee Details";
        if (pathname === '/settings/general') return t('settings_general.title');
        
        const item = navigationItems.find(navItem => 
            pathname === '/' ? navItem.href === '/' : navItem.href !== '/' && pathname.startsWith(navItem.href)
        );
        return item ? item.label : "FurnTrack";
    };

    const handleSignOut = async () => {
        try {
        await signOutAction();
        toast({ title: "Signed Out", description: "You have been successfully signed out." });
        } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
        }
    };

    return (
        <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
            <SidebarHeader className="p-4 flex-row items-center justify-between">
            <Logo />
            </SidebarHeader>
            <ScrollArea className="flex-1">
            <SidebarContent className="p-2">
            <SidebarMenu>
                {navigationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    {item.disabled ? (
                    <SidebarMenuButton
                        isActive={false}
                        tooltip={item.label}
                        disabled={true}
                        aria-disabled={true}
                        className={cn("cursor-not-allowed opacity-50")}
                    >
                        <div className="flex w-full items-center gap-2">
                        <item.icon className="size-3.5 md:size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </div>
                    </SidebarMenuButton>
                    ) : (
                    <SidebarMenuButton
                        asChild={true}
                        isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                        tooltip={item.label}
                    >
                        <Link href={item.href}>
                        <div className="flex w-full items-center gap-2">
                            <item.icon className="size-3.5 md:size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </div>
                        </Link>
                    </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarContent>
            </ScrollArea>
            <SidebarFooter className="p-2">
            <SidebarMenuItem className="list-none">
                <SidebarMenuButton
                asChild={true}
                isActive={pathname.startsWith('/settings')}
                tooltip={t('navigation.settings')}
                >
                <Link href="/settings">
                    <div className="flex w-full items-center gap-2">
                    <SettingsIcon className="size-3.5 md:size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">{t('navigation.settings')}</span>
                    </div>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            {user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="User Avatar" data-ai-hint="user avatar"/> 
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium group-data-[collapsible=icon]:hidden truncate max-w-[100px]">{user.email}</span>
                    <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuLabel>
                    <p className="text-sm font-medium leading-none truncate">
                        {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {user.role || 'User'} 
                    </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="cursor-pointer">
                    Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <SidebarMenuItem className="list-none">
                <SidebarMenuButton
                    asChild={true}
                    isActive={pathname === '/auth/login'}
                    tooltip="Login"
                >
                    <Link href="/auth/login">
                    <div className="flex w-full items-center gap-2">
                        <LogIn className="size-3.5 md:size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Login</span>
                    </div>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
            {isMobile ? (
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            ): null}
            <h1 className="text-xl font-semibold font-headline truncate">{getPageTitle()}</h1>
            <div className="ml-auto flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
            {children}
            </main>
        </SidebarInset>
        </div>
    );
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth/');

  if (isAuthPage) {
    // Render minimal layout for auth pages, without SidebarProvider
    return (
      <div className="relative min-h-screen">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </div>
    );
  }

  // Render the full layout for all other pages, wrapped in the SidebarProvider
  return (
    <SidebarProvider>
      <MainLayout user={user}>{children}</MainLayout>
    </SidebarProvider>
  );
}
