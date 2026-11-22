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
    { n: s.confirmados, label: 'Подтверждено', k: 'confirmado' },
    { n: s.rechazados, label: 'Отвергнуто', k: 'rechazado' },
    { n: s.inciertos, label: 'Под сомнением', k: 'incierto' },
  ];

  return (
    <section ref={root} id="cambios" data-section className="changes" aria-labelledby="cambios-titulo">
      <div className="changes__head">
        <p className="eyebrow">Биография начинает меняться</p>
        <h2 id="cambios-titulo" className="display">
          {doubted ? (
            <>
              Похоже, мы знаем твою историю <em>хуже, чем думали.</em>
            </>
          ) : s.revisados === 0 ? (
            <>
              Твоя история пока <em>нетронута</em>… потому что ты ещё не усомнился в ней.
            </>
          ) : (
            <>
              Пока всё как будто <em>совпадает.</em> Или это просто звучало правдоподобно?
            </>
          )}
        </h2>
      </div>

      <ul className="changes__counts" aria-label="Итог твоих решений">
        {counts.map((c) => (
          <li key={c.k} className={`changes__count changes__count--${c.k}`}>
            <span className="changes__num">{c.n}</span>
            <span className="changes__label">{c.label}</span>
          </li>
        ))}
      </ul>

      {firstPending && (
        <p className="changes__pending">
          {`Без проверки осталось: ${s.pendientes}.`}{' '}
          <button type="button" className="link-btn" onClick={() => scrollToId(`recuerdo-${firstPending.id}`, reduced)}>
            К первому
          </button>
        </p>
      )}

      <div className={`strip ${reduced ? 'strip--static' : ''}`}>
        <div className="strip__sticky">
          <p className="strip__caption" aria-hidden>
            Твоя жизнь после твоих решений
          </p>
          <ol className="strip__track" aria-label="Обновлённая линия жизни">
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
        История может казаться цельной, даже когда она <em>полна догадок.</em>
      </p>
    </section>
  );
}
