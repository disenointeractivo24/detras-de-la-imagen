import { useEffect, useRef, useState } from 'react';
import { shownImage } from '../lib/realImage';
import { ArrowDown, Brush, Check, HelpCircle, Pencil } from 'lucide-react';
import { DrawLayer } from './DrawLayer';
import { PromptGeneration } from './PromptGeneration';
import { useExperience } from '../lib/store';
import type { Memory } from '../lib/types';
import { formatAge, gsap, imgAttrs, scrollToId, tornClip, useGSAP } from '../lib/visual';
import { MemoryDecision } from './MemoryDecision';

interface Props {
  memory: Memory;
  index: number;
  nextId: string;
}

export function MemoryScene({ memory: m, index, nextId }: Props) {
  const { state, dispatch } = useExperience();
  const root = useRef<HTMLElement>(null);
  const tornRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  // Cuando la persona deshace lo inventado, la imagen vuelve a la foto real con una transición.
  const [shown, setShown] = useState(() => shownImage(m));
  const [swapping, setSwapping] = useState(false);
  useEffect(() => {
    const next = shownImage(m);
    if (next === shown) return;
    // Con la imagen nueva, los tachones ya cumplieron su función: se limpian.
    const swap = () => {
      setShown(next);
      dispatch({ type: 'draw', id: m.id, drawing: '' });
    };
    if (state.reducedMotion) { swap(); return; }
    setSwapping(true);
    const t1 = window.setTimeout(swap, 900);
    const t2 = window.setTimeout(() => setSwapping(false), 1900);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownImage(m)]);
  const reduced = state.reducedMotion;
  const flip = index % 2 === 1;
  const n = String(index + 1).padStart(2, '0');

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        '.memory__frame',
        { yPercent: 10 },
        { yPercent: -10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.fromTo(
        '.memory__bignum',
        { yPercent: 40, opacity: 0 },
        { yPercent: -30, opacity: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.from('.memory__reveal', {
        opacity: 0,
        y: 40,
        filter: 'blur(6px)',
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
      });
      gsap.from('.memory__frame', {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        clearProps: 'clipPath',
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  // Movimiento sutil de la fotografía con el cursor.
  const onMove = (e: React.PointerEvent) => {
    if (drawing || reduced || e.pointerType !== 'mouse') return;
    const r = root.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(root.current!.querySelector('.memory__tilt'), {
      rotateY: px * 5,
      rotateX: py * -4,
      x: px * 14,
      y: py * 10,
      duration: 1,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const rejected = m.evaluation === 'rechazado';
  const dateLabel = [formatAge(m.approxAge), m.approxYear ? String(m.approxYear) : null].filter(Boolean).join(' · ');

  return (
    <article
      ref={root}
      id={`recuerdo-${m.id}`}
      className={`memory ${flip ? 'memory--flip' : ''}`}
      data-state={m.visualState}
      aria-labelledby={`titulo-${m.id}`}
      onPointerMove={onMove}
    >
      <span className="memory__bignum" aria-hidden>
        {n}
      </span>

      <div className="memory__visual">
        <div className="memory__tilt">
          <figure className="memory__frame">
            <div ref={tornRef} className={`memory__torn ${swapping ? 'is-swapping' : ''}`} style={{ clipPath: tornClip(index + 11, 1.6, ['top', 'bottom']) }}>
            <div className="memory__photo">
              <img key={shown} {...imgAttrs(shown, "(max-width: 960px) 100vw, 60vw")} alt={m.imageAlt} loading="lazy" decoding="async" />
            </div>
            <svg className="memory__redx" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <filter id={`tiza-${m.id}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed={index + 3} result="ruido" />
                  <feDisplacementMap in="SourceGraphic" in2="ruido" scale="1.8" result="roto" />
                  <feComposite in="roto" in2="ruido" operator="in" />
                </filter>
              </defs>
              <g filter={`url(#tiza-${m.id})`}>
                <path className="memory__ok" pathLength={1} d="M28 52 C 35 58, 41 66, 45 73 C 55 52, 69 34, 85 18" />
              </g>
            </svg>
            {swapping && (
              <div className="undo" aria-live="polite">
                <p>{shownImage(m) === m.image ? 'Возвращаю версию машины…' : 'Стираю то, чего не было…'}</p>
              </div>
            )}
            <PromptGeneration memory={m} reduced={reduced} target={tornRef} />
            <DrawLayer
              key={shown}
              initial={m.drawing}
              active={drawing}
              onSave={(data) => dispatch({ type: 'draw', id: m.id, drawing: data })}
              onClose={() => setDrawing(false)}
              onMark={(mark) => dispatch({ type: 'evaluate', id: m.id, evaluation: mark === 'x' ? 'rechazado' : 'confirmado' })}
              onStroke={(cx, cy, size) => {
                // Un trazo sobre una parte inventada la borra de la imagen.
                if (size < 8) return;
                const layer = m.layers?.find((l) => l.region && cx >= l.region[0] && cx <= l.region[0] + l.region[2] && cy >= l.region[1] && cy <= l.region[1] + l.region[3]);
                if (layer && !m.erased?.includes(layer.id)) dispatch({ type: 'erase', id: m.id, layer: layer.id, on: true });
              }}
              onUnmark={() => dispatch({ type: 'evaluate', id: m.id, evaluation: 'pendiente' })}
            />
            </div>
            <figcaption className="sr-only">
              Иллюстрация, созданная для этого воспоминания; это не настоящая фотография из твоей жизни.
            </figcaption>
          </figure>
          <span className="memory__tape" aria-hidden>
            {formatAge(m.approxAge)}
          </span>
          {m.visualState === 'reconocido' && (
            <span className="memory__stamp memory__stamp--ok">
              <Check size={14} aria-hidden /> Воспоминание узнано
            </span>
          )}
          {m.visualState === 'incierto' && (
            <span className="memory__stamp memory__stamp--doubt">
              <HelpCircle size={14} aria-hidden /> Не подтверждено
            </span>
          )}
        </div>
      </div>

      <div className="memory__text">
        <p className="memory__meta memory__reveal">
          <span>Воспоминание {n}</span>
          <span className="memory__date">{dateLabel}</span>
        </p>
        <h3 id={`titulo-${m.id}`} className="memory__title memory__reveal">
          {m.title}
        </h3>

        <div className="memory__statement-wrap memory__reveal">
          {m.correction && !editing && (
            <>
              <p className="memory__yours-label">Твоя версия</p>
              <p className="memory__yours">{m.correction}</p>
            </>
          )}
          {editing ? (
            <form
              className="memory__edit"
              onSubmit={(e) => {
                e.preventDefault();
                dispatch({ type: 'correct', id: m.id, correction: draft.trim() === m.statement ? '' : draft.trim() });
                setEditing(false);
              }}
            >
              <textarea
                className="memory__edit-field"
                value={draft}
                rows={4}
                maxLength={400}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Твоя версия этого воспоминания"
              />
              <div className="memory__tools">
                <button type="submit" className="draw__tool draw__tool--done">
                  <Check size={14} aria-hidden /> Сохранить
                </button>
                <button type="button" className="draw__tool" onClick={() => setEditing(false)}>
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <p className={`memory__statement ${m.correction ? 'memory__statement--old' : ''}`}>
              <span className="memory__statement-text">
                {m.statement.split(' ').map((word, i) => (
                  <span key={i}>
                    <button
                      type="button"
                      className={`word ${m.struck?.includes(i) ? 'is-struck' : ''}`}
                      aria-pressed={!!m.struck?.includes(i)}
                      onClick={() => dispatch({ type: 'strike', id: m.id, word: i })}
                    >
                      {word}
                    </button>{' '}
                  </span>
                ))}
              </span>
            </p>
          )}
          {!editing && (
            <div className="memory__tools">
              <button
                type="button"
                className="draw__tool"
                onClick={() => {
                  setDraft(m.correction || m.statement);
                  setEditing(true);
                }}
              >
                <Pencil size={14} aria-hidden /> Изменить текст
              </button>
              <button type="button" className={`draw__tool ${drawing ? 'is-on' : ''}`} onClick={() => setDrawing((d) => !d)}>
                <Brush size={14} aria-hidden /> {drawing ? 'Рисую…' : 'Мел'}
              </button>
            </div>
          )}
        </div>

        <p className="memory__hint memory__reveal">Рисуй на фото: <b>✕</b> — этого не было, <b>✓</b> — это было. Нажми на неверные слова, чтобы зачеркнуть их.</p>

        <div className="memory__reveal">
          <MemoryDecision
            id={m.id}
            value={m.evaluation}
            onChange={(evaluation) => dispatch({ type: 'evaluate', id: m.id, evaluation })}
          />
        </div>

        <div className="memory__feedback" aria-live="polite">
          {m.evaluation === 'confirmado' && (
            <p className="feedback feedback--ok">Совпало. Но машина не вспомнила — она угадала.</p>
          )}
          {m.evaluation === 'incierto' && (
            <p className="feedback feedback--doubt">Если ты сомневаешься, почему машина была так уверена?</p>
          )}
          {rejected && <p className="feedback feedback--no">Этого не было. И всё же звучало как твоя жизнь.</p>}
        </div>

        {m.evaluation !== 'pendiente' && (
          <button type="button" className="link-btn memory__next" onClick={() => scrollToId(nextId, reduced)}>
            Дальше во времени <ArrowDown size={14} aria-hidden />
          </button>
        )}
      </div>
    </article>
  );
}
