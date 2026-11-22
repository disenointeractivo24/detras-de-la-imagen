import { useEffect, useRef, useState } from 'react';
import { formatAge } from '../lib/visual';
import type { Memory } from '../lib/types';

/** Recuerdos que ya se "generaron" en esta visita: al volver con el scroll no se repite. */
const generated = new Set<string>();

type Phase = 'idle' | 'typing' | 'rendering' | 'done';

/** Construye el prompt con el que la máquina "pide" la imagen del recuerdo. */
export function promptFor(m: Memory) {
  const escena = m.imageAlt
    .replace(/\s*Фотография из примера\.?$/i, '')
    .replace(/\s*\(иллюстрация\)\.?$/i, '')
    .replace(/\.$/, '')
    .toLowerCase();
  const cuando = [m.approxAge !== null ? formatAge(m.approxAge) : null, m.approxYear].filter(Boolean).join(', ');
  return `${escena}${cuando ? `, ${cuando}` : ''}, фото из семейного альбома, чёрно-белое, плёночное зерно, естественный свет`;
}

interface Props {
  memory: Memory;
  reduced: boolean;
  /** Elemento que contiene la foto; se le pone data-gen para desenfocarla mientras se "genera". */
  target: React.RefObject<HTMLElement>;
}

/**
 * Simula que la imagen del recuerdo se genera a partir de un prompt:
 * primero se escribe el prompt, luego la foto aparece desde el ruido.
 */
export function PromptGeneration({ memory: m, reduced, target }: Props) {
  const prompt = promptFor(m);
  const skip = reduced || generated.has(m.id);
  const [phase, setPhase] = useState<Phase>(skip ? 'done' : 'idle');
  const [typed, setTyped] = useState(0);
  const [progress, setProgress] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  // Arranca cuando el recuerdo entra en pantalla.
  useEffect(() => {
    if (phase !== 'idle' || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase('typing');
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [phase]);

  // Escritura del prompt, letra por letra.
  useEffect(() => {
    if (phase !== 'typing') return;
    if (typed >= prompt.length) {
      const t = window.setTimeout(() => setPhase('rendering'), 350);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setTyped((n) => n + 1), 22 + Math.random() * 30);
    return () => window.clearTimeout(t);
  }, [phase, typed, prompt.length]);

  // "Generación": la foto sale del ruido mientras sube el porcentaje.
  useEffect(() => {
    if (phase !== 'rendering') return;
    const start = performance.now();
    const dur = 2200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      target.current?.style.setProperty('--gen', String(1 - p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        generated.add(m.id);
        setPhase('done');
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, m.id, target]);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    if (phase === 'done') {
      el.removeAttribute('data-gen');
      el.style.removeProperty('--gen');
    } else {
      el.setAttribute('data-gen', phase);
      if (phase !== 'rendering') el.style.setProperty('--gen', '1');
    }
  }, [phase, target]);

  if (phase === 'done') return null;

  return (
    <div ref={box} className={`gen gen--${phase}`} aria-hidden>
      <div className="gen__console">
        <p className="gen__prompt">
          <span className="gen__caret-label">описание &gt;</span> {prompt.slice(0, typed)}
          {phase !== 'rendering' && <span className="gen__caret" />}
        </p>
        {phase === 'rendering' && (
          <p className="gen__status">
            Восстанавливаю то, что могло быть… {Math.round(progress * 100)}%
            <span className="gen__bar">
              <span style={{ transform: `scaleX(${progress})` }} />
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
