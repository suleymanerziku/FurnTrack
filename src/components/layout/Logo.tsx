"use client";

import Link from 'next/link';
import { Building2 } from 'lucide-react'; // Using a generic business icon

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline text-primary">
      <Building2 className="h-6 w-6" />
      <span>FurnTrack</span>
    </Link>
  );
}
