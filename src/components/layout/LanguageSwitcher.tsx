
'use client';
import { useChangeLocale, useCurrentLocale, useScopedI18n } from '@/locales/client';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();
  const t = useScopedI18n('language_switcher');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('label')}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale('en')} disabled={locale === 'en'}>
          {t('en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('am')} disabled={locale === 'am'}>
          {t('am')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('om')} disabled={locale === 'om'}>
          {t('om')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('ti')} disabled={locale === 'ti'}>
          {t('ti')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
