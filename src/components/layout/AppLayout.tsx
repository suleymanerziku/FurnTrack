
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList, // Will be removed from main nav
  ListChecks,
  DollarSign,
  Settings as SettingsIcon,
  Wand2,
  MoreHorizontal,
  LogOut,
  Menu,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  // { href: '/task-types', label: 'Task Types', icon: ClipboardList }, // Removed
  { href: '/work-log', label: 'Work Log', icon: ListChecks },
  { href: '/finances', label: 'Finances', icon: DollarSign },
  { href: '/ai-insights', label: 'AI Insights', icon: Wand2 },
];

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, toggleSidebar } = useSidebar(); 

  const getPageTitle = () => {
    if (pathname === '/settings/users') return "User Management";
    if (pathname === '/settings/profile') return "Profile Settings";
    if (pathname === '/settings/task-types') return "Task Type Management"; // Added
    if (pathname === '/settings') return "Settings";
    
    const item = navigationItems.find(navItem => 
      pathname === '/' ? navItem.href === '/' : navItem.href !== '/' && pathname.startsWith(navItem.href)
    );
    return item ? item.label : "FurnTrack";
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
                      <item.icon />
                      <span>{item.label}</span>
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
                        <item.icon />
                        <span>{item.label}</span>
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
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild={true}
              isActive={pathname === '/settings' || pathname.startsWith('/settings/')}
              tooltip="Settings"
            >
              <Link href="/settings">
                <div className="flex w-full items-center gap-2">
                  <SettingsIcon />
                  <span>Settings</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar"/>
                  <AvatarFallback>FT</AvatarFallback>
                </Avatar>
                <span className="font-medium group-data-[collapsible=icon]:hidden">Admin User</span>
                <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="cursor-pointer">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">FurnTrack Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@furntrack.com
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
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
