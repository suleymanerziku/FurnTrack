
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ListChecks,
  DollarSign,
  Sparkles,
  Settings as SettingsIcon,
  Menu,
  MoreHorizontal,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  SidebarTrigger,
  useSidebar,
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
} from "@/components/ui/dropdown-menu"

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/task-types', label: 'Task Types', icon: ClipboardList },
  { href: '/task-assignments', label: 'Task Assignments', icon: ListChecks },
  { href: '/finances', label: 'Finances', icon: DollarSign },
  { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const getPageTitle = () => {
    const item = navigationItems.find(item => pathname === '/' ? item.href === '/' : item.href !== '/' && pathname.startsWith(item.href));
    return item ? item.label : "FurnTrack";
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <ScrollArea className="flex-1">
        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                    tooltip={item.label}
                    disabled={item.disabled}
                    aria-disabled={item.disabled}
                    className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                  >
                    {/* 
                      When item.disabled is false, asChild is true. 
                      The child must be a single element that can accept props from Slot.
                      Using a div structure consistent for both disabled and enabled states.
                    */}
                    <div className="flex w-full items-center gap-2">
                      <item.icon />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4 border-t">
           {/* User profile or app version could go here */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>FT</AvatarFallback>
                </Avatar>
                <span className="font-medium group-data-[collapsible=icon]:hidden">Admin User</span>
                <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">FurnTrack Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@furntrack.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Package className="mr-2 h-4 w-4" />
                <span>Log out (Disabled)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          {isMobile && <SidebarTrigger><Menu /></SidebarTrigger>}
          <h1 className="text-xl font-semibold font-headline">{getPageTitle()}</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
