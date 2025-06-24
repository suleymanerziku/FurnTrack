
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/locales/i18n';

// This page is hit when the user visits the root `/`.
// The middleware will likely redirect them to `/{locale}` before this renders.
// This acts as a fallback to redirect to the default language.
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
