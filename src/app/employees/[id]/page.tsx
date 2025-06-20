
import { redirect } from 'next/navigation';

export default function OldEmployeeDetailPage({ params }: { params: { id: string } }) {
  redirect(`/settings/employees/${params.id}`);
  // return null;
}
