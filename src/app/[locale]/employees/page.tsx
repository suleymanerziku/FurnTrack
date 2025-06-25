
import { redirect } from 'next/navigation';

export default function OldEmployeesPage() {
  redirect('/settings/employees');
  // return null; // Or a loading/message component
}
