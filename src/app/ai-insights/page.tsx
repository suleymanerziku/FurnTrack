
import { redirect } from 'next/navigation';

// This page has been moved to `/[locale]/ai-insights`.
// This file is kept to redirect users from the old path.
export default function OldPage() {
  redirect('/ai-insights');
}
