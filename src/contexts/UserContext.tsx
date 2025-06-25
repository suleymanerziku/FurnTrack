'use client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/lib/types';
import { createContext, useContext, type ReactNode } from 'react';

type UserWithRole = (SupabaseAuthUser & Partial<AppUser>) | null;

const UserContext = createContext<UserWithRole | undefined>(undefined);

export function UserProvider({ children, user }: { children: ReactNode, user: UserWithRole }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
