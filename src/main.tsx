import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ExperienceProvider } from './lib/store';
import { ScrollTrigger } from './lib/visual';
import './styles/global.css';

// Al abrir o recargar, siempre desde arriba (el navegador no restaura el scroll anterior).
const toTop = () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
};
// ScrollTrigger guarda la preferencia al cargarse y la reaplica: se la indicamos explícitamente.
ScrollTrigger.clearScrollMemory('manual');
toTop();
// El navegador puede restaurar la posición después de cargar: volvemos arriba en cada momento clave.
window.addEventListener('load', () => {
  toTop();
  requestAnimationFrame(toTop);
});
window.addEventListener('pageshow', toTop);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </StrictMode>,
);
