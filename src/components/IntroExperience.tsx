import { useRef } from 'react';
import { DEMO_NAME } from '../lib/demo';
import { useExperience } from '../lib/store';
import { gsap, img, scrollToId, tornClip, useGSAP } from '../lib/visual';

/** Fragmentos fotográficos ilustrativos dispersos alrededor del título. */
const FRAGMENTS = [
  { src: 'nino-balon', x: 16, y: 4, w: 19, r: -2 },
  { src: 'caminando', x: 0, y: 24, w: 15, r: -6 },
  { src: 'pasillo', x: 6, y: 64, w: 24, r: 1 },
  { src: 'columpios', x: 72, y: 0, w: 28, r: 2 },
  { src: 'calle', x: 76, y: 60, w: 24, r: -3 },
  { src: 'bebe', x: 38, y: 78, w: 13, r: 4 },
  { src: 'nube', x: 58, y: 82, w: 14, r: -5 },
  { src: 'parque', x: 55, y: -4, w: 13, r: 5 },
  { src: 'nina-columpio', x: 88, y: 30, w: 12, r: 3 },
];

const TITLE = ['ПО ТУ', 'СТОРОНУ', 'КАДРА'];

export function IntroExperience() {
  const { state, dispatch } = useExperience();
  const root = useRef<HTMLElement>(null);
  const reduced = state.reducedMotion;

  useGSAP(
    () => {
      if (reduced) return;
      const intro = gsap.timeline({ delay: 0.3 });
      intro
        .from('.intro__char', { yPercent: 110, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.04 })
        .from('.intro__subtitle', { opacity: 0, y: 24, filter: 'blur(6px)', duration: 1.4, ease: 'power3.out' }, '-=0.7')
        .from('.intro__cta > *', { opacity: 0, y: 12, duration: 1, stagger: 0.12, ease: 'power2.out' }, '-=0.8')
        .from('.intro__frag', { opacity: 0, scale: 1.08, duration: 2.4, stagger: 0.08, ease: 'power2.out' }, 0);

      // Al desplazarse: el título sube y los fragmentos convergen hacia el centro.
      const st = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });
      st.to('.intro__title', { yPercent: -60, scale: 0.82, opacity: 0, ease: 'none', duration: 0.5 }, 0)
        .to('.intro__subtitle, .intro__cta', { y: -120, opacity: 0, ease: 'none', duration: 0.35 }, 0)
        .to(
          '.intro__frag',
          {
            left: '42%',
            top: '38%',
            rotate: (i) => (i % 2 ? 6 : -6) * (i / 3),
            scale: 0.55,
            ease: 'power1.inOut',
            duration: 0.8,
            stagger: 0.015,
          },
          0.1,
        )
        .to('.intro__frags', { opacity: 0, duration: 0.2 }, 0.8)
        .fromTo('.intro__handoff', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.78);
    },
    { scope: root, dependencies: [reduced] },
  );

  const onMove = (e: React.PointerEvent) => {
    const el = root.current;
    if (!el) return;
    const stage = el.querySelector<HTMLElement>('.intro__stage');
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    stage.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    if (!reduced) {
      gsap.to('.intro__frags', {
        x: ((e.clientX - r.width / 2) / r.width) * -18,
        y: ((e.clientY - r.height / 2) / r.height) * -12,
        duration: 1.2,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  };

  const fragments = (lit: boolean) =>
    FRAGMENTS.map((f, i) => (
      <figure
        key={`${f.src}-${lit}`}
        className="intro__frag"
        style={{
          left: `${f.x}%`,
          top: `${f.y}%`,
          width: `${f.w}vw`,
          transform: `rotate(${f.r}deg)`,
          clipPath: tornClip(i + 3, 2.6, ['top', 'bottom', 'left', 'right']),
        }}
      >
        <img src={img(f.src)} alt="" loading={i < 5 ? 'eager' : 'lazy'} decoding="async" />
      </figure>
    ));

  return (
    <section id="inicio" ref={root} className="intro" aria-labelledby="titulo-principal" onPointerMove={onMove}>
      <div className="intro__stage">
        <div className="intro__frags intro__frags--dim" aria-hidden>
          {fragments(false)}
        </div>
        <div className="intro__frags intro__frags--lit" aria-hidden>
          {fragments(true)}
        </div>

        <div className="intro__content">
          <h1 id="titulo-principal" className="intro__title" aria-label="По ту сторону кадра">
            {TITLE.map((line, li) => (
              <span key={line} className={`intro__line ${li === 2 ? 'intro__line--italic' : ''}`} aria-hidden>
                {[...line].map((c, ci) => (
                  <span key={ci} className="intro__char">
                    {c === ' ' ? ' ' : c}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="intro__subtitle">
            2050. ИИ уже восстанавливает всё прошлое человечества. Сегодня — твоё.
          </p>
          <div className="intro__cta">
            <div className="intro__buttons">
              <button type="button" className="btn btn--line" onClick={() => scrollToId('identidad', reduced)}>
                Начать
              </button>
              {state.memories.length > 0 && !state.demo && (
                <button
                  type="button"
                  className="btn btn--solid"
                  onClick={() => {
                    window.scrollTo({ top: 0 });
                    dispatch({ type: 'setPhase', phase: 'biografia' });
                  }}
                >
                  Продолжить мою биографию
                </button>
              )}
              <button
                type="button"
                className="btn btn--text"
                onClick={() => {
                  window.scrollTo({ top: 0 });
                  dispatch({ type: 'loadDemo' });
                }}
              >
                Пример: {DEMO_NAME}
              </button>
            </div>
            <div className="scroll-cue" aria-hidden>
              <span className="scroll-cue__line" />
              <span className="scroll-cue__dot" />
            </div>
            <p className="intro__hint">Листай, чтобы начать.</p>
          </div>
        </div>

        <p className="intro__handoff" aria-hidden>
          Жизнь, которую ИИ думает, что знает.
        </p>
        <p className="intro__disclaimer">Иллюстративные изображения. Ни одна фотография не принадлежит твоему прошлому.</p>
      </div>
    </section>
  );
}
