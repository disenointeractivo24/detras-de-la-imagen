import { useRef } from 'react';
import { useExperience } from '../lib/store';
import type { LifeStage, Memory } from '../lib/types';
import { DEMO_ART } from '../lib/demo';
import { chapterArt } from '../lib/narrative';
import { formatAge, gsap, imgAttrs, tornClip, useGSAP } from '../lib/visual';
import { MemoryScene } from './MemoryScene';


interface Props {
  stage: { id: LifeStage; numero: string; titulo: string; lema: string };
  memories: Memory[];
  /** Edad con la que termina la etapa anterior (para el contador animado). */
  fromAge: number | null;
  startIndex: number;
  nextIds: string[];
}

export function LifeChapter({ stage, memories, fromAge, startIndex, nextIds }: Props) {
  const { state } = useExperience();
  const root = useRef<HTMLElement>(null);
  const reduced = state.reducedMotion;
  const birthYear = state.profile.edad !== null ? new Date().getFullYear() - state.profile.edad : null;
  const toAge = memories[memories.length - 1]?.approxAge ?? null;
  const art = state.demo ? DEMO_ART[stage.id] : chapterArt(stage.id, state.seed, state.memories);

  useGSAP(
    () => {
      const ageEl = root.current?.querySelector<HTMLElement>('.chapter__age-num');
      const yearEl = root.current?.querySelector<HTMLElement>('.chapter__year-num');
      if (reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.chapter__cover', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      });
      tl.fromTo('.chapter__bg img', { scale: 1.45 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .fromTo('.chapter__bg', { opacity: 0.2 }, { opacity: 0.55, ease: 'none', duration: 0.5 }, 0)
        .fromTo(
          '.chapter__word',
          { scale: 1.5, letterSpacing: '0.18em', opacity: 0 },
          { scale: 1, letterSpacing: '-0.02em', opacity: 1, ease: 'power2.out', duration: 0.55 },
          0,
        )
        .fromTo('.chapter__front', { yPercent: 90, rotate: -6 }, { yPercent: -8, rotate: 2, ease: 'none', duration: 1 }, 0.15)
        .fromTo('.chapter__meta', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0.2)
        .to('.chapter__word', { yPercent: -25, opacity: 0.25, duration: 0.35, ease: 'none' }, 0.65);

      if (fromAge !== null && toAge !== null && ageEl && yearEl && birthYear !== null) {
        const c = { a: fromAge };
        tl.to(
          c,
          {
            a: toAge,
            ease: 'none',
            duration: 0.8,
            onUpdate: () => {
              const a = Math.round(c.a);
              ageEl.textContent = String(a);
              yearEl.textContent = String(birthYear + a);
            },
          },
          0.1,
        );
      }
    },
    { scope: root, dependencies: [reduced, fromAge, toAge] },
  );

  return (
    <section ref={root} id={`capitulo-${stage.id}`} data-section className="chapter" aria-labelledby={`cap-${stage.id}`}>
      <div className="chapter__cover">
        <div className="chapter__sticky">
          <div className="chapter__bg" aria-hidden>
            <img {...imgAttrs(art.cover)} alt="" loading="lazy" />
          </div>
          <p className="chapter__meta chapter__meta--top">
            <span>Глава {stage.numero}</span>
            <span className="chapter__line" aria-hidden />
            {toAge !== null && birthYear !== null ? (
              <span className="chapter__year" aria-label={`Год ${birthYear + toAge}`}>
                <span className="chapter__year-num">{birthYear + toAge}</span>
              </span>
            ) : (
              <span>Год неизвестен</span>
            )}
          </p>
          <h2
            id={`cap-${stage.id}`}
            className="chapter__word"
            style={{ fontSize: `min(280px, calc(92vw / ${(stage.titulo.length * 1.25).toFixed(2)}))` }}
          >
            {stage.titulo}
          </h2>
          <figure className="chapter__front" aria-hidden style={{ clipPath: tornClip(stage.numero.charCodeAt(1), 2.4, ['top', 'bottom', 'left', 'right']) }}>
            <img {...imgAttrs(art.front, "40vw")} alt="" loading="lazy" />
          </figure>
          <div className="chapter__meta chapter__meta--bottom">
            <p className="chapter__lema">{stage.lema}</p>
            {toAge !== null && (
              <p className="chapter__age">
                <span className="chapter__age-label">Примерный возраст</span>
                <span className="chapter__age-value">
                  <span className="chapter__age-num">{toAge}</span> {formatAge(toAge).split(' ')[1]}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {memories.map((m, i) => (
        <MemoryScene key={m.id} memory={m} index={startIndex + i} nextId={nextIds[i]} />
      ))}
    </section>
  );
}
