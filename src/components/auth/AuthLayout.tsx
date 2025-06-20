
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/layout/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full shadow-xl"> {/* Removed max-w-md */}
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FurnTrack. All rights reserved.
      </footer>
    </div>
  );
}
