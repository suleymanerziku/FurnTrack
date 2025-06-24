
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
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
