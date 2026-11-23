import type { ReactNode } from 'react';
import { NavigationControls } from './NavigationControls';
import { t } from '../lib/i18n';

export function ExperienceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        {t('К содержанию', 'Saltar al contenido')}
      </a>
      <NavigationControls />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
