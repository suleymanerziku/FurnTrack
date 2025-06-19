
"use client";

import Link from 'next/link';
import { Sofa } from 'lucide-react'; // Changed from Building2 to Sofa

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline text-primary">
      <Sofa className="h-6 w-6" /> {/* Changed from Building2 to Sofa */}
      <span>FurnTrack</span>
    </Link>
  );
}
