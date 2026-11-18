import { useRef } from 'react';
import { computeStats } from '../lib/narrative';
import { useExperience } from '../lib/store';
import { gsap, scrollToId, useGSAP } from '../lib/visual';
import { MemoryThumb } from './MemoryThumb';

/** Escena 06: la biografía se fragmenta según las decisiones reales de la persona. */
export function BiographyTransformation() {
  const { state } = useExperience();
  const root = useRef<HTMLElement>(null);
  const reduced = state.reducedMotion;
  const s = computeStats(state.memories);
  const firstPending = state.memories.find((m) => m.evaluation === 'pendiente');
  const doubted = s.rechazados + s.inciertos > 0;

  useGSAP(
    () => {
      if (reduced) return;
      const track = root.current?.querySelector<HTMLElement>('.strip__track');
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.strip',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(track, { x: () => window.innerWidth * 0.35 }, { x: () => -distance(), ease: 'none' });
      gsap.from('.changes__head > *', {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.changes__head', start: 'top 70%', once: true },
      });
      gsap.from('.changes__count', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.changes__counts', start: 'top 80%', once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const counts = [
    { n: s.confirmados, label: s.confirmados === 1 ? 'Confirmado' : 'Confirmados', k: 'confirmado' },
    { n: s.rechazados, label: s.rechazados === 1 ? 'Rechazado' : 'Rechazados', k: 'rechazado' },
    { n: s.inciertos, label: s.inciertos === 1 ? 'Incierto' : 'Inciertos', k: 'incierto' },
  ];

  return (
    <section ref={root} id="cambios" data-section className="changes" aria-labelledby="cambios-titulo">
      <div className="changes__head">
        <p className="eyebrow">La biografía empieza a cambiar</p>
        <h2 id="cambios-titulo" className="display">
          {doubted ? (
            <>
              Parece que no conocemos tu historia <em>tan bien como creíamos.</em>
            </>
          ) : s.revisados === 0 ? (
            <>
              Tu historia sigue <em>intacta</em>… porque aún no la has puesto en duda.
            </>
          ) : (
            <>
              Hasta ahora, todo parece <em>coincidir.</em> ¿O solo sonaba creíble?
            </>
          )}
        </h2>
      </div>

      <ul className="changes__counts" aria-label="Resumen de tus decisiones">
        {counts.map((c) => (
          <li key={c.k} className={`changes__count changes__count--${c.k}`}>
            <span className="changes__num">{c.n}</span>
            <span className="changes__label">{c.label}</span>
          </li>
        ))}
      </ul>

      {firstPending && (
        <p className="changes__pending">
          {s.pendientes === 1 ? 'Queda 1 recuerdo sin revisar.' : `Quedan ${s.pendientes} recuerdos sin revisar.`}{' '}
          <button type="button" className="link-btn" onClick={() => scrollToId(`recuerdo-${firstPending.id}`, reduced)}>
            Ir al primero
          </button>
        </p>
      )}

      <div className={`strip ${reduced ? 'strip--static' : ''}`}>
        <div className="strip__sticky">
          <p className="strip__caption" aria-hidden>
            Tu vida, tal como queda después de tus decisiones
          </p>
          <ol className="strip__track" aria-label="Línea de vida actualizada">
            {state.memories.map((m, i) => (
              <li key={m.id} className="strip__item" data-state={m.visualState}>
                <MemoryThumb memory={m} index={i} version="tuya" />
                <span className="strip__seg" aria-hidden />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="changes__statement">
        Una historia puede parecer completa, incluso cuando está <em>llena de suposiciones.</em>
      </p>
    </section>
  );
}
