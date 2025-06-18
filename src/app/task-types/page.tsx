
// This page has been moved to /settings/task-types
// This file can be deleted or kept as a redirect if needed.
// For now, leaving it empty or with a minimal component to avoid breaking direct navigation.

import { redirect } from 'next/navigation';

export default function OldTaskTypesPage() {
  redirect('/settings/task-types');
  return null; // Or a loading state / minimal message
}
