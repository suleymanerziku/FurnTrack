
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/AppLayout';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { I18nProviderClient } from '@/locales/client';

export const revalidate = 0;

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: 'en' | 'am' | 'om' | 'ti' };
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let user = authUser;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', user.id)
      .single();

    if (profile) {
      // Combine auth user with profile data.
      // This will overwrite the 'role' from authUser with the one from our users table.
      user = {
        ...user,
        ...profile,
      };
    }
  }

  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AppLayout user={user}>{children}</AppLayout>
        <Toaster />
      </ThemeProvider>
    </I18nProviderClient>
  );
}
