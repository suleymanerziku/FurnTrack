
import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'FurnTrack',
  description: 'Furniture Manufacturing Management',
  icons: null,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // This root layout is intentionally minimal.
  // The main layout logic, including providers, is in `src/app/[locale]/layout.tsx`.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body">{children}</body>
    </html>
  );
}
