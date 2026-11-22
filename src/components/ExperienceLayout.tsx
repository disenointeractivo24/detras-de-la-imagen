import type { ReactNode } from 'react';
import { NavigationControls } from './NavigationControls';

export function ExperienceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        К содержанию
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
