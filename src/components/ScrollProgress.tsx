import { useEffect, useRef, useState } from 'react';
import { useExperience } from '../lib/store';
import { formatAge, scrollToId } from '../lib/visual';
import { EVAL_LABEL } from './MemoryThumb';

/** Línea de vida fija: muestra el avance por la biografía y el estado de cada recuerdo. */
export function ScrollProgress() {
  const { state } = useExperience();
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const reduced = state.reducedMotion;
  const { memories } = state;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const start = document.getElementById('biografia');
      const end = document.getElementById('cambios');
      if (!start || !end || !fillRef.current) return;
      const top = start.offsetTop;
      const bottom = end.offsetTop;
      const p = Math.max(0, Math.min(1, (window.scrollY + window.innerHeight * 0.5 - top) / (bottom - top)));
      fillRef.current.style.transform = `scaleX(${p})`;
      // Recuerdo más cercano al centro de la pantalla.
      let current: string | null = null;
      for (const m of memories) {
        const el = document.getElementById(`recuerdo-${m.id}`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.6) current = r.bottom > window.innerHeight * 0.3 ? m.id : null;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [memories]);

  const activeMem = memories.find((m) => m.id === active);
  const hidden = ['comparacion', 'reflexion'].includes(state.currentStage);

  return (
    <nav className={`progress ${hidden ? 'is-hidden' : ''}`} aria-label="Линия твоей жизни">
      <div className="progress__readout" aria-hidden>
        {activeMem ? (
          <>
            <span>≈ {formatAge(activeMem.approxAge)}</span>
            {activeMem.approxYear && <span>{activeMem.approxYear}</span>}
          </>
        ) : (
          <span>Твоя жизнь</span>
        )}
      </div>
      <div className="progress__bar">
        <span className="progress__axis" aria-hidden />
        <span ref={fillRef} className="progress__fill" aria-hidden />
        <ol className="progress__nodes">
          {memories.map((m, i) => (
            <li key={m.id} style={{ left: `${((i + 0.5) / memories.length) * 100}%` }}>
              <button
                type="button"
                className={`progress__node progress__node--${m.evaluation} ${active === m.id ? 'is-active' : ''}`}
                onClick={() => scrollToId(`recuerdo-${m.id}`, reduced)}
                aria-label={`Воспоминание ${i + 1}: ${m.title}. ${EVAL_LABEL[m.evaluation]}`}
                aria-current={active === m.id ? 'step' : undefined}
              />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
