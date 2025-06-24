
import { redirect } from 'next/navigation';

// This page has been moved to `/[locale]/reports`.
// This file is kept to redirect users from the old path.
export default function OldPage() {
  redirect('/reports');
}
