import { Fragment, useRef } from 'react';
import { introLines } from '../lib/content';
import { useExperience } from '../lib/store';
import { STAGES } from '../lib/types';
import { DEMO_FIRST_PHOTO } from '../lib/content';
import { gsap, imgAttrs, useGSAP } from '../lib/visual';
import { LifeChapter } from './LifeChapter';
import { t } from '../lib/i18n';

/** Escena 04 + 05: la biografía visual recorrida cronológicamente con el scroll. */
export function BiographyTimeline() {
  const { state } = useExperience();
  const root = useRef<HTMLDivElement>(null);
  const reduced = state.reducedMotion;
  const { memories, profile } = state;
  const lines = introLines(profile);

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.bio-open', start: 'top top', end: 'bottom bottom', scrub: 0.7 },
      });
      tl.fromTo('.bio-open__photo', { scale: 0.32, borderRadius: 4 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.bio-open__photo img', { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to('.bio-open__title', { scale: 0.85, opacity: 0.0, ease: 'none', duration: 0.6 }, 0.35)
        .fromTo('.bio-open__shade', { opacity: 0 }, { opacity: 0.72, duration: 0.4 }, 0.55)
        .fromTo('.bio-open__line', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.3 }, 0.62);
      gsap.from('.bio-open__title .w', { yPercent: 100, opacity: 0, stagger: 0.08, duration: 1.4, ease: 'expo.out', delay: 0.2 });
    },
    { scope: root, dependencies: [reduced] },
  );

  const titleWords = t('Такой мы видим твою историю.', 'Así creemos que fue tu historia.').split(' ');
  let cursor = 0;
  const firstOf = (stageId: string) => memories.find((m) => m.stage === stageId);

  return (
    <div ref={root} className="bio">
      <section id="biografia" data-section className="bio-open" aria-labelledby="bio-titulo">
        <div className="bio-open__sticky">
          <h2 id="bio-titulo" className="bio-open__title">
            {titleWords.map((w, i) => (
              <Fragment key={i}>
                <span className="w-wrap">
                  <span className={`w ${w === t('историю.', 'historia.') ? 'w--italic' : ''}`}>{w}</span>
                </span>{' '}
              </Fragment>
            ))}
          </h2>
          <figure className="bio-open__photo" aria-hidden>
            <img {...imgAttrs(state.demo ? DEMO_FIRST_PHOTO : 'bebe')} alt="" />
            <span className="bio-open__shade" />
          </figure>
          <div className="bio-open__lines">
            <p className="bio-open__line bio-open__source">{t('По тому, что ты нам рассказал', 'A partir de lo que nos contaste')}</p>
            {lines.map((l) => (
              <p key={l} className="bio-open__line bio-open__statement">
                {l}
              </p>
            ))}
            <p className="bio-open__line bio-open__instr">
              {t('Листай. Если чего-то не было — зачеркни.', 'Desliza. Si algo no pasó, táchalo tú.')}
            </p>
          </div>
        </div>
      </section>

      {STAGES.map((s, si) => {
        const ms = memories.filter((m) => m.stage === s.id);
        const startIndex = cursor;
        cursor += ms.length;
        const prevStage = STAGES[si - 1];
        const prevMems = prevStage ? memories.filter((m) => m.stage === prevStage.id) : [];
        const fromAge = prevStage ? prevMems[prevMems.length - 1]?.approxAge ?? null : profile.edad !== null ? 0 : null;
        const nextIds = ms.map((_, i) => {
          if (i < ms.length - 1) return `recuerdo-${ms[i + 1].id}`;
          const nextStage = STAGES[si + 1];
          return nextStage && firstOf(nextStage.id) ? `capitulo-${nextStage.id}` : 'cambios';
        });
        return (
          <LifeChapter key={s.id} stage={s} memories={ms} fromAge={fromAge} startIndex={startIndex} nextIds={nextIds} />
        );
      })}
    </div>
  );
}
