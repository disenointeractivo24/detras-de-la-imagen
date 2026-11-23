import { useRef, useState } from 'react';
import { ArrowRight, FastForward } from 'lucide-react';
import { DEMO_FIRST_PHOTO } from '../lib/content';
import { introLines } from '../lib/content';
import { useExperience } from '../lib/store';
import { gsap, imgAttrs, tornClip, useGSAP } from '../lib/visual';
import { t } from '../lib/i18n';

const milestones = () =>
  t(
    ['Рождение', 'Первые воспоминания', 'Детство', 'Юность', 'Важные решения', 'Настоящее'],
    ['Nacimiento', 'Primeros recuerdos', 'Infancia', 'Adolescencia', 'Decisiones importantes', 'Presente'],
  );
const messages = () =>
  t(
    ['Читаю твои немногие данные…', 'Заполняю пробелы клише…', 'Вычисляю, что звучит правдоподобно…', 'Шлифую жизнь, которую никто не видел…'],
    ['Leyendo tus pocos datos…', 'Rellenando los huecos con clichés…', 'Calculando qué suena verosímil…', 'Puliendo una vida que nunca vimos…'],
  );

export function ReconstructionSequence() {
  const { state, dispatch } = useExperience();
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [message, setMessage] = useState(() => messages()[0]);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const reduced = state.reducedMotion;
  const lines = introLines(state.profile);
  const photos = [state.demo ? DEMO_FIRST_PHOTO : 'bebe', ...state.memories.map((m) => m.image)].slice(0, 8);

  useGSAP(
    () => {
      const t = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          setDone(true);
          window.setTimeout(() => root.current?.querySelector<HTMLButtonElement>('.recon__enter')?.focus(), 60);
        },
      });
      tl.current = t;
      const say = (i: number) => () => setMessage(messages()[i]);
      const counter = { n: 0 };

      t.from('.recon__title', { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.6 })
        .from('.recon__rule', { scaleX: 0, duration: 1 }, '-=1')
        .call(say(0))
        .from('.recon__axis', { scaleX: 0, transformOrigin: 'left center', duration: 2.2, ease: 'power2.inOut' })
        .from('.recon__node', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.28 }, '-=1.8')
        .from('.recon__label', { opacity: 0, y: 12, duration: 0.6, stagger: 0.28 }, '<')
        .call(say(1))
        .fromTo(
          '.recon__photo',
          { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0, y: 30 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            duration: 1.3,
            stagger: { each: 0.32, from: 'start' },
            ease: 'expo.out',
          },
        )
        .to(counter, { n: photos.length, duration: 0.32 * photos.length + 0.6, ease: 'none', onUpdate: () => setCount(Math.round(counter.n)) }, '<')
        .call(say(2), [], '-=1.4')
        .from('.recon__line', { opacity: 0, y: 16, filter: 'blur(6px)', duration: 1.1, stagger: 0.9 }, '-=0.8')
        .call(say(3))
        .to('.recon__fill', { scaleX: 1, duration: 2, ease: 'power1.inOut' })
        .to('.recon__status', { opacity: 0, duration: 0.4 })
        .call(() => setDone(true))
        .from('.recon__ready > *', { opacity: 0, y: 20, duration: 0.9, stagger: 0.18 });

      if (reduced) t.progress(1);
    },
    { scope: root },
  );

  const skip = () => {
    tl.current?.progress(1);
    setCount(photos.length);
  };

  const enter = () => {
    window.scrollTo({ top: 0 });
    dispatch({ type: 'setPhase', phase: 'biografia' });
  };

  return (
    <section ref={root} className="recon" aria-labelledby="recon-titulo">
      <div className="recon__head">
        <h2 id="recon-titulo" className="recon__title">
          {t(<>Одна жизнь. Тысячи <em>воспоминаний.</em></>, <>Una vida. Miles de <em>recuerdos.</em></>)}
        </h2>
        <span className="recon__rule" aria-hidden />
      </div>

      <div className="recon__collage" aria-hidden>
        {photos.map((p, i) => (
          <figure
            key={`${p}-${i}`}
            className="recon__photo"
            style={{ ['--h' as string]: `${((i * 3) % 5) * 1.6}vh`, zIndex: 10 - (i % 3), transform: `rotate(${(((i * 37) % 9) - 4) * 0.6}deg)`, clipPath: tornClip(i + 40, 3, ['top', 'bottom', 'left', 'right']) }}
          >
            <img {...imgAttrs(p, "20vw")} alt="" />
          </figure>
        ))}
      </div>

      <div className="recon__timeline" aria-hidden>
        <span className="recon__axis" />
        <span className="recon__fill" />
        {milestones().map((m, i, all) => (
          <div key={m} className="recon__milestone" style={{ left: `${(i / (all.length - 1)) * 100}%` }}>
            <span className="recon__node" />
            <span className="recon__label">{m}</span>
          </div>
        ))}
      </div>

      <div className="recon__text">
        {lines.map((l) => (
          <p key={l} className="recon__line">
            {l}
          </p>
        ))}
      </div>

      <div className="recon__status" role="status" aria-live="polite">
        <span className="recon__pulse" aria-hidden />
        <span>{message}</span>
        <span className="recon__count">
          {count}/{photos.length} {t('воспоминаний', 'recuerdos')}
        </span>
      </div>

      {!done && (
        <button type="button" className="recon__skip link-btn" onClick={skip}>
          <FastForward size={14} aria-hidden /> {t('Пропустить анимацию', 'Saltar animación')}
        </button>
      )}

      <div
        className={`recon__ready ${done ? 'is-ready' : ''}`}
        aria-hidden={!done}
        {...({ inert: done ? undefined : '' } as object)}
      >
        <p className="recon__ready-title">{t('Твоя история готова.', 'Tu historia está lista.')}</p>
        {state.demo ? (
          <p className="recon__disclosure">
            {t(
              `Это реальный пример: фотографии принадлежат ${state.profile.nombre}, но тексты написала симуляция. Некоторые изображения изменены ИИ. Сможешь угадать, какие воспоминания настоящие?`,
              `Este es un ejemplo real: las fotografías pertenecen a ${state.profile.nombre}, pero los textos los escribió la simulación. Algunas imágenes fueron alteradas con IA. ¿Puedes adivinar cuáles recuerdos son verdaderos?`,
            )}
          </p>
        ) : (
          <p className="recon__disclosure">
            {t('Прежде чем начать: эта биография — симуляция. Она собрана из немногих данных, которыми ты поделился, и повествовательных шаблонов. Мы не обращались к базам данных, соцсетям или личным архивам. Фотографии иллюстративные.', 'Antes de empezar: esta biografía es una simulación. Fue construida con los pocos datos que compartiste y con plantillas narrativas. No consultamos bases de datos, redes sociales ni archivos personales. Las fotografías son ilustrativas.')}
          </p>
        )}
        <button type="button" className="btn btn--solid recon__enter" onClick={enter}>
          {t('Открыть мою жизнь', 'Descubrir mi vida')} <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </section>
  );
}
