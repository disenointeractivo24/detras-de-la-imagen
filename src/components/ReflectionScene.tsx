import { useRef, useState } from 'react';
import { RotateCcw, BookOpen } from 'lucide-react';
import { computeStats } from '../lib/content';
import { ru as plural } from '../lib/visual';
import { clearStorage, useExperience } from '../lib/store';
import { formatAge, gsap, img, scrollToId, useGSAP } from '../lib/visual';
import { ConfirmDialog } from './ConfirmDialog';
import { t } from '../lib/i18n';

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

  const recuerdos = (n: number) => `${n} ${n === 1 ? 'recuerdo' : 'recuerdos'}`;
  const stats: string[] = [
    s.revisados === s.total
      ? t(`Ты просмотрел ${plural(s.total, 'воспоминание', 'воспоминания', 'воспоминаний')}.`, `Exploraste ${recuerdos(s.total)}.`)
      : t(`Ты просмотрел ${s.revisados} из ${plural(s.total, 'воспоминания', 'воспоминаний', 'воспоминаний')}.`, `Exploraste ${s.revisados} de ${recuerdos(s.total)}.`),
  ];
  if (s.confirmados) stats.push(t(`Узнал: ${s.confirmados}.`, `Reconociste ${s.confirmados}.`));
  if (s.rechazados) stats.push(t(`Отверг: ${s.rechazados}.`, `Rechazaste ${s.rechazados}.`));
  if (s.inciertos) stats.push(t(`Не подтвердил: ${s.inciertos}.`, `Dejaste ${s.inciertos} sin confirmar.`));
  if (s.pendientes) stats.push(t(`Без проверки: ${s.pendientes}.`, `${s.pendientes === 1 ? 'Uno quedó' : `${s.pendientes} quedaron`} sin revisar.`));

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
          {t(<>Кто <em>на самом деле</em> знает твою историю?</>, <>¿Quién conoce <em>realmente</em> tu historia?</>)}
        </h2>
      </div>

      <ul className="reflect__stats reflect__beat" aria-label={t('Твои результаты', 'Tus resultados')}>
        {stats.map((line) => (
          <li key={line} className="reflect__stat">
            {line}
          </li>
        ))}
      </ul>

      <div className="tally reflect__beat" aria-label={t('Итог', 'Recuento')}>
        <div className="tally__col tally__col--ok">
          <h3 className="tally__head">
            <span className="tally__num">{hits.length}</span> {t('Угадал', 'Acertó')}
          </h3>
          <ul>
            {hits.map((m) => (
              <li key={m.id}>
                <span className="tally__age">{m.approxAge !== null ? formatAge(m.approxAge) : ''}</span> {m.title}
              </li>
            ))}
            {hits.length === 0 && <li className="tally__empty">{t('Ничего.', 'Nada.')}</li>}
          </ul>
        </div>
        <div className="tally__col tally__col--no">
          <h3 className="tally__head">
            <span className="tally__num">{misses.length}</span> {t('Ошибся', 'Falló')}
          </h3>
          <ul>
            {misses.map((m) => (
              <li key={m.id}>
                <span className="tally__age">{m.approxAge !== null ? formatAge(m.approxAge) : ''}</span> {m.title}
                {m.correction && <span className="tally__fix">{t('Твоя версия', 'Tu versión')}: «{m.correction}»</span>}
              </li>
            ))}
            {misses.length === 0 && <li className="tally__empty">{t('Ничего.', 'Nada.')}</li>}
          </ul>
        </div>
        {doubts.length > 0 && (
          <p className="tally__doubt">
            {t(`Под сомнением или без проверки: ${doubts.length}.`, `${doubts.length === 1 ? 'Un recuerdo quedó' : `${doubts.length} recuerdos quedaron`} en duda o sin revisar.`)}
          </p>
        )}
      </div>

      <div className="reflect__seq">
        <p className="reflect__beat">{t('Из нескольких данных мы смогли собрать историю о тебе.', 'Con unos pocos datos, pudimos construir una historia sobre ti.')}</p>
        <p className="reflect__beat">
          {s.confirmados > 0 ? t('Что-то могло совпасть с твоей жизнью.', 'Algunas partes pudieron coincidir con tu vida.') : t('Возможно, ничего не совпало с твоей жизнью.', 'Quizá ninguna parte coincidió con tu vida.')}
        </p>
        <p className="reflect__beat">
          {s.rechazados > 0
            ? t('Что-то никогда не происходило.', 'Otras nunca sucedieron.')
            : s.inciertos > 0
              ? t('Что-то ты не смог подтвердить.', 'Otras no pudiste confirmarlas.')
              : t('И всё же каждая деталь была догадкой.', 'Y aun así, cada detalle fue una suposición.')}
        </p>
      </div>

      <div className="reflect__seq reflect__seq--wide">
        <p className="reflect__beat">
          {t('В глобусе 2050 года то, что могло быть, хранится рядом с тем, что было, — с той же чёткостью.', 'En el globo de 2050, lo que pudo haber sido se guarda al lado de lo que fue, con la misma nitidez.')}
        </p>
        <p className="reflect__beat reflect__big">
          {t(<>Если он не отличает одно от другого в твоей жизни, как он справится с историей <em>всего человечества?</em></>, <>Si no distingue una cosa de la otra en tu vida, ¿cómo lo hará con la historia de <em>toda la humanidad?</em></>)}
        </p>
      </div>

      <div className="reflect__beat reflect__final">
        <p className="reflect__message">
          {t(<>ИИ может рассказать твою историю, <em>но не может помнить твою жизнь.</em></>, <>La IA puede contar tu historia, <em>pero no puede recordar tu vida.</em></>)}
        </p>
        <p className="reflect__support">{t('Прежде чем принять реконструкцию, спроси, кто её описал и кто проверил.', 'Antes de aceptar una reconstrucción, pregunta quién la describió y quién la verificó.')}</p>
        <div className="rights" aria-label={t('Твои права на твою память', 'Tus derechos sobre tu memoria')}>
          <p className="eyebrow">{t('Что предлагает этот проект', 'Lo que este proyecto propone')}</p>
          <ol className="rights__list">
            {t(
              <>
                <li><strong>Право исправлять.</strong> Твоя версия весит больше любой статистики.</li>
                <li><strong>Право сомневаться.</strong> «Не уверен» — тоже ответ.</li>
                <li><strong>Право на пустоту.</strong> Есть части жизни, которые никому не нужно дополнять.</li>
                <li><strong>Право не быть стереотипом.</strong> У кого меньше данных в сети, тот не заслуживает более выдуманной истории.</li>
              </>,
              <>
                <li><strong>Derecho a corregir.</strong> Tu versión pesa más que cualquier estadística.</li>
                <li><strong>Derecho a dudar.</strong> «No estoy seguro» también es una respuesta válida.</li>
                <li><strong>Derecho al vacío.</strong> Hay partes de tu vida que nadie necesita completar.</li>
                <li><strong>Derecho a no ser un estereotipo.</strong> Quien tiene menos datos en la red no merece una historia más inventada.</li>
              </>,
            )}
          </ol>
          <p className="rights__close">{t(<>Память не реконструируют: <em>её рассказывают, и рассказываешь её ты.</em></>, <>La memoria no se reconstruye: <em>se cuenta, y la cuentas tú.</em></>)}</p>
        </div>
        <div className="reflect__actions">
          <button type="button" className="btn btn--dark" onClick={() => setConfirm(true)}>
            <RotateCcw size={16} aria-hidden /> {t('Пройти заново', 'Volver a vivir la experiencia')}
          </button>
          <button type="button" className="btn btn--outline-dark" onClick={() => scrollToId('biografia', reduced)}>
            <BookOpen size={16} aria-hidden /> {t('Вернуться к биографии', 'Revisar mi biografía')}
          </button>
        </div>
        <p className="reflect__credit">
          {t('По мотивам сценария «3D-реконструкция истории человечества», Earth 2050, Москва. Все изображения иллюстративные.', 'Inspirado en el escenario «3D Reconstruction of the Human History» de Earth 2050. Todas las imágenes son ilustrativas.')}
        </p>
      </div>

      <ConfirmDialog
        open={confirm}
        title={t('Начать заново?', '¿Volver a empezar?')}
        body={t('Твои ответы, биография, решения и правки будут удалены из этого браузера.', 'Se borrarán tus respuestas, la biografía generada, tus decisiones y tus correcciones guardadas en este navegador.')}
        confirmLabel={t('Да, начать заново', 'Sí, empezar de nuevo')}
        onConfirm={restart}
        onCancel={() => setConfirm(false)}
      />
    </section>
  );
}
