import { useRef, useState } from 'react';
import { RotateCcw, BookOpen } from 'lucide-react';
import { computeStats, plural } from '../lib/narrative';
import { clearStorage, useExperience } from '../lib/store';
import { formatAge, gsap, img, scrollToId, useGSAP } from '../lib/visual';
import { ConfirmDialog } from './ConfirmDialog';

/** Escena 08: la reflexión final, con resultados calculados a partir de las decisiones reales. */
export function ReflectionScene() {
  const { state, dispatch } = useExperience();
  const root = useRef<HTMLElement>(null);
  const [confirm, setConfirm] = useState(false);
  const reduced = state.reducedMotion;
  const s = computeStats(state.memories);
  const hits = state.memories.filter((m) => m.evaluation === 'confirmado');
  // Falló: lo rechazaste, o lo reescribiste con tus palabras.
  const misses = state.memories.filter((m) => m.evaluation === 'rechazado' || (m.correction && m.evaluation !== 'confirmado'));
  const doubts = state.memories.filter((m) => !hits.includes(m) && !misses.includes(m));

  useGSAP(
    () => {
      if (reduced) return;
      // El fondo pasa del negro al blanco cálido mientras la biografía se aleja.
      gsap.fromTo(
        root.current,
        { backgroundColor: '#101010', color: '#F2F0EB' },
        {
          backgroundColor: '#F2F0EB',
          color: '#101010',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top -40%', scrub: true },
        },
      );
      gsap.fromTo(
        '.reflect__distance',
        { scale: 1, opacity: 0.9, yPercent: 0 },
        {
          scale: 0.35,
          opacity: 0,
          yPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: '.reflect__distance', start: 'top 70%', end: 'bottom top', scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>('.reflect__beat').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          filter: 'blur(10px)',
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        });
      });
      gsap.from('.reflect__stat', {
        opacity: 0,
        x: -30,
        stagger: 0.18,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.reflect__stats', start: 'top 70%', once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const stats: string[] = [
    s.revisados === s.total
      ? `Ты просмотрел ${plural(s.total, 'воспоминание', 'воспоминания', 'воспоминаний')}.`
      : `Ты просмотрел ${s.revisados} из ${plural(s.total, 'воспоминания', 'воспоминаний', 'воспоминаний')}.`,
  ];
  if (s.confirmados) stats.push(`Узнал: ${s.confirmados}.`);
  if (s.rechazados) stats.push(`Отверг: ${s.rechazados}.`);
  if (s.inciertos) stats.push(`Не подтвердил: ${s.inciertos}.`);
  if (s.pendientes) stats.push(`Без проверки: ${s.pendientes}.`);

  const restart = () => {
    clearStorage();
    dispatch({ type: 'reset' });
    setConfirm(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="reflexion" data-section ref={root} className="reflect" aria-labelledby="reflect-titulo">
      <div className="reflect__distance" aria-hidden>
        {state.memories.map((m) => (
          <span key={m.id} className="reflect__mini" data-state={m.visualState}>
            {m.visualState !== 'vacio' && m.visualState !== 'corregido' && <img src={img(m.image)} alt="" loading="lazy" />}
          </span>
        ))}
      </div>

      <div className="reflect__beat reflect__intro">
        <h2 id="reflect-titulo" className="display">
          Кто <em>на самом деле</em> знает твою историю?
        </h2>
      </div>

      <ul className="reflect__stats reflect__beat" aria-label="Твои результаты">
        {stats.map((t) => (
          <li key={t} className="reflect__stat">
            {t}
          </li>
        ))}
      </ul>

      <div className="tally reflect__beat" aria-label="Итог">
        <div className="tally__col tally__col--ok">
          <h3 className="tally__head">
            <span className="tally__num">{hits.length}</span> Угадал
          </h3>
          <ul>
            {hits.map((m) => (
              <li key={m.id}>
                <span className="tally__age">{m.approxAge !== null ? formatAge(m.approxAge) : ''}</span> {m.title}
              </li>
            ))}
            {hits.length === 0 && <li className="tally__empty">Ничего.</li>}
          </ul>
        </div>
        <div className="tally__col tally__col--no">
          <h3 className="tally__head">
            <span className="tally__num">{misses.length}</span> Ошибся
          </h3>
          <ul>
            {misses.map((m) => (
              <li key={m.id}>
                <span className="tally__age">{m.approxAge !== null ? formatAge(m.approxAge) : ''}</span> {m.title}
                {m.correction && <span className="tally__fix">Твоя версия: «{m.correction}»</span>}
              </li>
            ))}
            {misses.length === 0 && <li className="tally__empty">Ничего.</li>}
          </ul>
        </div>
        {doubts.length > 0 && (
          <p className="tally__doubt">
            Под сомнением или без проверки: {doubts.length}.
          </p>
        )}
      </div>

      <div className="reflect__seq">
        <p className="reflect__beat">Из нескольких данных мы смогли собрать историю о тебе.</p>
        <p className="reflect__beat">
          {s.confirmados > 0 ? 'Что-то могло совпасть с твоей жизнью.' : 'Возможно, ничего не совпало с твоей жизнью.'}
        </p>
        <p className="reflect__beat">
          {s.rechazados > 0
            ? 'Что-то никогда не происходило.'
            : s.inciertos > 0
              ? 'Что-то ты не смог подтвердить.'
              : 'И всё же каждая деталь была догадкой.'}
        </p>
      </div>

      <div className="reflect__seq reflect__seq--wide">
        <p className="reflect__beat">
          В глобусе 2050 года то, что могло быть, хранится рядом с тем, что было, — с той же чёткостью.
        </p>
        <p className="reflect__beat reflect__big">
          Если он не отличает одно от другого в твоей жизни, как он справится с историей <em>всего человечества?</em>
        </p>
      </div>

      <div className="reflect__beat reflect__final">
        <p className="reflect__message">
          ИИ может рассказать твою историю, <em>но не может помнить твою жизнь.</em>
        </p>
        <p className="reflect__support">Прежде чем принять реконструкцию, спроси, кто её описал и кто проверил.</p>
        <div className="rights" aria-label="Твои права на твою память">
          <p className="eyebrow">Что предлагает этот проект</p>
          <ol className="rights__list">
            <li><strong>Право исправлять.</strong> Твоя версия весит больше любой статистики.</li>
            <li><strong>Право сомневаться.</strong> «Не уверен» — тоже ответ.</li>
            <li><strong>Право на пустоту.</strong> Есть части жизни, которые никому не нужно дополнять.</li>
            <li><strong>Право не быть стереотипом.</strong> У кого меньше данных в сети, тот не заслуживает более выдуманной истории.</li>
          </ol>
          <p className="rights__close">Память не реконструируют: <em>её рассказывают, и рассказываешь её ты.</em></p>
        </div>
        <div className="reflect__actions">
          <button type="button" className="btn btn--dark" onClick={() => setConfirm(true)}>
            <RotateCcw size={16} aria-hidden /> Пройти заново
          </button>
          <button type="button" className="btn btn--outline-dark" onClick={() => scrollToId('biografia', reduced)}>
            <BookOpen size={16} aria-hidden /> Вернуться к биографии
          </button>
        </div>
        <p className="reflect__credit">
          По мотивам сценария «3D-реконструкция истории человечества», Earth 2050, Москва. Все изображения иллюстративные.
        </p>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Начать заново?"
        body="Твои ответы, биография, решения и правки будут удалены из этого браузера."
        confirmLabel="Да, начать заново"
        onConfirm={restart}
        onCancel={() => setConfirm(false)}
      />
    </section>
  );
}
