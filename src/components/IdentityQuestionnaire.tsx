import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { useExperience } from '../lib/store';
import type { Profile } from '../lib/types';
import { fechaLarga, parseCumpleanos } from '../lib/zodiac';
import { img, tornClip } from '../lib/visual';

type Key = keyof Profile;

interface Question {
  key: Key;
  pregunta: string;
  ayuda: string;
  placeholder: string;
  requerido?: boolean;
  tipo?: 'text' | 'number' | 'fecha';
  /** Respuestas cerradas: sin escritura libre. */
  opciones?: string[];
  max: number;
  resumen: string;
}

const QUESTIONS: Question[] = [
  {
    key: 'nombre',
    pregunta: 'Как тебя зовут?',
    ayuda: 'Имя или прозвище. Мы используем его только для твоей истории.',
    placeholder: 'Напиши своё имя',
    requerido: true,
    max: 40,
    resumen: 'Имя',
  },
  {
    key: 'edad',
    pregunta: 'Сколько тебе лет?',
    ayuda: 'Это поможет расставить воспоминания во времени.',
    placeholder: 'Например, 21',
    tipo: 'number',
    max: 3,
    resumen: 'Возраст',
  },
  {
    key: 'cumpleanos',
    pregunta: 'Когда у тебя день рождения?',
    ayuda: 'Только день и месяц, например 14/08. Год не нужен.',
    placeholder: 'ДД/ММ',
    tipo: 'fecha',
    max: 20,
    resumen: 'День рождения',
  },
  {
    key: 'ciudadNacimiento',
    pregunta: 'В каком городе ты родился?',
    ayuda: 'Только название города. Адрес мы никогда не спросим.',
    placeholder: 'Например, Кали',
    max: 50,
    resumen: 'Город рождения',
  },
  {
    key: 'ciudadActual',
    pregunta: 'А где ты живёшь сейчас?',
    ayuda: 'Может быть тот же город, где ты родился.',
    placeholder: 'Например, Богота',
    max: 50,
    resumen: 'Город сейчас',
  },
  {
    key: 'interes',
    pregunta: 'Расскажи, что ты любишь.',
    ayuda: 'Одно слово или короткая фраза: музыка, футбол, рисование…',
    placeholder: 'Например, музыка',
    max: 50,
    resumen: 'Увлечение',
  },
  {
    key: 'hito',
    pregunta: 'Какой момент твоей жизни для тебя важен?',
    ayuda: 'Выбери один. Остальное машина сделает сама.',
    placeholder: '',
    opciones: ['Мой выпускной', 'Когда я переехал', 'Одно путешествие', 'Когда я кого-то встретил', 'Когда я кого-то потерял', 'Моя первая работа'],
    max: 120,
    resumen: 'Важный момент',
  },
];

const RING = [
  { src: 'hojas', cls: 'q-frag--a' },
  { src: 'nina-columpio', cls: 'q-frag--b' },
  { src: 'nube', cls: 'q-frag--c' },
  { src: 'edificio', cls: 'q-frag--d' },
  { src: 'campo', cls: 'q-frag--e' },
];

const toText = (v: Profile[Key]) => (v === null || v === undefined ? '' : String(v));

export function IdentityQuestionnaire() {
  const { state, dispatch } = useExperience();
  const reduced = state.reducedMotion;
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(step);
  const [generating, setGenerating] = useState(false);
  const isReview = step === QUESTIONS.length;
  const q = QUESTIONS[step];

  const goTo = (i: number) => {
    setStep(i);
    setFurthest((f) => Math.max(f, i));
  };

  const commit = (key: Key, parsed: Profile[Key]) =>
    dispatch({ type: 'setProfile', profile: { ...state.profile, [key]: parsed } });

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const start = () => {
    if (!state.profile.nombre.trim()) {
      goTo(0);
      return;
    }
    setGenerating(true);
    window.setTimeout(
      () => {
        window.scrollTo({ top: 0 });
        dispatch({ type: 'generate' });
      },
      reduced ? 600 : 2600,
    );
  };

  const variants: Variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -28, filter: 'blur(8px)' },
      };

  return (
    <section id="identidad" className="identity" aria-labelledby="identidad-titulo">
      <div className="identity__ring" aria-hidden>
        {RING.map((f, i) => (
          <figure key={f.src} className={`q-frag ${f.cls}`} style={{ clipPath: tornClip(i + 21, 2.4, ['top', 'bottom', 'right']) }}>
            <img src={img(f.src)} alt="" loading="lazy" />
          </figure>
        ))}
        <svg className="identity__curve" viewBox="0 0 1600 300" preserveAspectRatio="none">
          <path d="M0 220 C 300 80, 520 300, 820 200 S 1300 40, 1600 120" />
        </svg>
      </div>

      <div className="identity__inner">
        <p id="identidad-titulo" className="eyebrow">
          Чтобы восстановить твою историю, сначала нужно узнать тебя.
        </p>

        <div className="identity__stage" aria-live="polite">
          <AnimatePresence mode="wait">
            {!isReview ? (
              <QuestionForm
                key={q.key}
                q={q}
                initial={toText(state.profile[q.key])}
                isFirst={step === 0}
                reduced={reduced}
                variants={variants}
                onSubmit={(parsed) => {
                  commit(q.key, parsed);
                  // Si la persona vino desde el resumen para corregir algo, regresa al resumen.
                  goTo(furthest === QUESTIONS.length ? QUESTIONS.length : step + 1);
                }}
                onBack={(parsed) => {
                  if (parsed !== undefined) commit(q.key, parsed);
                  back();
                }}
                onSkip={() => {
                  commit(q.key, q.tipo === 'number' ? null : '');
                  goTo(step + 1);
                }}
              />
            ) : (
              <motion.div
                key="resumen"
                className="review"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="review__title">Вот что ты нам рассказал.</h2>
                <dl className="review__list">
                  {QUESTIONS.map((qq, i) => {
                    const raw = toText(state.profile[qq.key]);
                    const v = qq.key === 'cumpleanos' && raw ? fechaLarga(raw) || raw : raw;
                    return (
                      <div key={qq.key} className="review__item">
                        <dt>{qq.resumen}</dt>
                        <dd>
                          <span className={v ? '' : 'review__empty'}>{v || 'Без ответа'}</span>
                          <button type="button" className="icon-btn" onClick={() => goTo(i)} aria-label={`Изменить: ${qq.resumen}`}>
                            <Pencil size={14} aria-hidden />
                          </button>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="review__privacy">
                  Нам не нужны документы, адреса, пароли или доступ к твоим соцсетям. Всё остаётся
                  в этом браузере.
                </p>
                <div className="review__actions">
                  <button type="button" className="link-btn" onClick={back}>
                    <ArrowLeft size={14} aria-hidden /> Назад
                  </button>
                  <button type="button" className="btn btn--solid" onClick={start}>
                    Восстановить мою историю <ArrowRight size={16} aria-hidden />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ol className="steps" aria-label="Прогресс вопросов">
          {[...QUESTIONS, null].map((qq, i) => (
            <li key={qq?.key ?? 'resumen'}>
              <button
                type="button"
                className={`steps__dot ${i === step ? 'is-current' : ''} ${i < furthest || i === step ? 'is-done' : ''}`}
                disabled={i > furthest}
                onClick={() => goTo(i)}
                aria-current={i === step ? 'step' : undefined}
                aria-label={qq ? `Вопрос ${i + 1}: ${qq.resumen}` : 'Сводка ответов'}
              />
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence>
        {generating && (
          <motion.div
            className="generating"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.2 : 1.6 }}
          >
            <p>Восстанавливаем твою историю…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


type Variants = Record<'initial' | 'animate' | 'exit', Record<string, string | number>>;

/** Validación de una respuesta. Devuelve el valor interpretado o un mensaje de error. */
function parseAnswer(q: Question, raw: string): { ok: true; value: Profile[Key] } | { ok: false; error: string } {
  const v = raw.trim();
  if (q.requerido && !v) return { ok: false, error: 'Напиши имя или прозвище, чтобы продолжить.' };
  if (q.tipo === 'fecha') {
    if (!v) return { ok: true, value: '' };
    const f = parseCumpleanos(v);
    if (!f) return { ok: false, error: 'Напиши день и месяц, например 14/08, или оставь вопрос без ответа.' };
    return { ok: true, value: f };
  }
  if (q.tipo === 'number') {
    if (!v) return { ok: true, value: null };
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 120)
      return { ok: false, error: 'Укажи возраст от 1 до 120 или оставь вопрос без ответа.' };
    return { ok: true, value: n };
  }
  return { ok: true, value: v };
}

interface QuestionFormProps {
  q: Question;
  initial: string;
  isFirst: boolean;
  reduced: boolean;
  variants: Variants;
  onSubmit: (v: Profile[Key]) => void;
  onBack: (v: Profile[Key] | undefined) => void;
  onSkip: () => void;
}

/** Cada pregunta tiene su propio estado: así la que sale y la que entra nunca comparten valor. */
function QuestionForm({ q, initial, isFirst, reduced, variants, onSubmit, onBack, onSkip }: QuestionFormProps) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    // Solo enfocamos si la sección está en pantalla, para no provocar saltos de scroll.
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top > 0 && r.bottom < window.innerHeight) el.focus({ preventScroll: true });
  };

  const leave = (fn: () => void) => {
    setLeaving(true);
    inputRef.current?.blur();
    fn();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leaving) return;
    const r = parseAnswer(q, value);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    leave(() => onSubmit(r.value));
  };

  return (
    <motion.form
      className="question"
      onSubmit={submit}
      noValidate
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={(def) => def === 'animate' && focusInput()}
    >
      <label id={`label-${q.key}`} htmlFor={q.opciones ? undefined : `campo-${q.key}`} className="question__label">
        {q.pregunta}
      </label>
      {q.opciones ? (
        <div className="question__chips" role="group" aria-labelledby={`label-${q.key}`}>
          {q.opciones.map((o) => (
            <button key={o} type="button" className={`chip ${value === o ? 'is-selected' : ''}`} onClick={() => !leaving && leave(() => onSubmit(o))}>
              {o}
            </button>
          ))}
        </div>
      ) : (
      <div className="question__row">
        <input
          ref={inputRef}
          id={`campo-${q.key}`}
          className="question__input"
          type="text"
          inputMode={q.tipo === 'number' ? 'numeric' : 'text'}
          autoComplete="off"
          maxLength={q.max}
          placeholder={q.placeholder}
          value={value}
          readOnly={leaving}
          onChange={(e) => {
            setValue(q.tipo === 'number' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value);
            setError('');
          }}
          aria-describedby={`ayuda-${q.key}${error ? ` error-${q.key}` : ''}`}
          aria-invalid={!!error}
          aria-required={q.requerido}
        />
        <button type="submit" className="question__go" aria-label="Далее">
          <ArrowRight size={20} aria-hidden />
        </button>
      </div>
      )}
      <p id={`ayuda-${q.key}`} className="question__help">
        {q.ayuda} {q.requerido ? '' : <span className="question__optional">(Необязательно)</span>}
      </p>
      {error && (
        <p id={`error-${q.key}`} className="question__error" role="alert">
          {error}
        </p>
      )}
      <div className="question__nav">
        <button
          type="button"
          className="link-btn"
          disabled={isFirst}
          onClick={() => {
            const r = parseAnswer(q, value);
            leave(() => onBack(r.ok ? r.value : undefined));
          }}
        >
          <ArrowLeft size={14} aria-hidden /> Назад
        </button>
        {!q.requerido && (
          <button type="button" className="link-btn" onClick={() => leave(onSkip)}>
            Пропустить вопрос
          </button>
        )}
        <span className="question__kbd" aria-hidden>
          Нажми <kbd>Enter</kbd>, чтобы продолжить
        </span>
      </div>
    </motion.form>
  );
}
