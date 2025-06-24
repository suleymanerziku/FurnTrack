
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/AppLayout';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'FurnTrack',
  description: 'Furniture Manufacturing Management',
  icons: null, // Explicitly disable default icon handling
};

// Ensure revalidation for dynamic data like auth session
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // Only light/dark
          disableTransitionOnChange
        >
          {/* AppLayout now handles conditional rendering of SidebarProvider */}
          <AppLayout user={user}>{children}</AppLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
