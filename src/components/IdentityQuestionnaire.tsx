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
    pregunta: '¿Cómo te llamas?',
    ayuda: 'Tu nombre o un apodo. Solo lo usaremos para contar tu historia.',
    placeholder: 'Escribe tu nombre',
    requerido: true,
    max: 40,
    resumen: 'Nombre',
  },
  {
    key: 'edad',
    pregunta: '¿Cuántos años tienes?',
    ayuda: 'Nos ayuda a ubicar tus recuerdos en el tiempo.',
    placeholder: 'Por ejemplo, 21',
    tipo: 'number',
    max: 3,
    resumen: 'Edad',
  },
  {
    key: 'cumpleanos',
    pregunta: '¿Qué día cumples años?',
    ayuda: 'Solo el día y el mes, por ejemplo 14/08. No necesitamos el año.',
    placeholder: 'DD/MM',
    tipo: 'fecha',
    max: 20,
    resumen: 'Cumpleaños',
  },
  {
    key: 'ciudadNacimiento',
    pregunta: '¿En qué ciudad naciste?',
    ayuda: 'Solo el nombre de la ciudad. Nunca pediremos direcciones.',
    placeholder: 'Por ejemplo, Cali',
    max: 50,
    resumen: 'Ciudad de nacimiento',
  },
  {
    key: 'ciudadActual',
    pregunta: '¿Y en qué ciudad vives ahora?',
    ayuda: 'Puede ser la misma en la que naciste.',
    placeholder: 'Por ejemplo, Bogotá',
    max: 50,
    resumen: 'Ciudad actual',
  },
  {
    key: 'interes',
    pregunta: 'Cuéntanos algo que te apasione.',
    ayuda: 'Una palabra o una frase corta: la música, el fútbol, dibujar…',
    placeholder: 'Por ejemplo, la música',
    max: 50,
    resumen: 'Interés',
  },
  {
    key: 'hito',
    pregunta: '¿Qué momento de tu vida consideras importante?',
    ayuda: 'Elige uno. La máquina se encargará del resto.',
    placeholder: '',
    opciones: ['El día de mi grado', 'Cuando me mudé', 'Un viaje', 'Cuando conocí a alguien', 'Cuando perdí a alguien', 'Mi primer trabajo'],
    max: 120,
    resumen: 'Momento importante',
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
          Para reconstruir tu historia, primero necesitamos conocerte.
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
                <h2 className="review__title">Esto es lo que nos contaste.</h2>
                <dl className="review__list">
                  {QUESTIONS.map((qq, i) => {
                    const raw = toText(state.profile[qq.key]);
                    const v = qq.key === 'cumpleanos' && raw ? fechaLarga(raw) || raw : raw;
                    return (
                      <div key={qq.key} className="review__item">
                        <dt>{qq.resumen}</dt>
                        <dd>
                          <span className={v ? '' : 'review__empty'}>{v || 'Sin responder'}</span>
                          <button type="button" className="icon-btn" onClick={() => goTo(i)} aria-label={`Editar: ${qq.resumen}`}>
                            <Pencil size={14} aria-hidden />
                          </button>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="review__privacy">
                  No necesitamos documentos de identidad, direcciones, contraseñas ni acceso a tus redes. Todo se queda en
                  este navegador.
                </p>
                <div className="review__actions">
                  <button type="button" className="link-btn" onClick={back}>
                    <ArrowLeft size={14} aria-hidden /> Atrás
                  </button>
                  <button type="button" className="btn btn--solid" onClick={start}>
                    Reconstruir mi historia <ArrowRight size={16} aria-hidden />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ol className="steps" aria-label="Progreso de las preguntas">
          {[...QUESTIONS, null].map((qq, i) => (
            <li key={qq?.key ?? 'resumen'}>
              <button
                type="button"
                className={`steps__dot ${i === step ? 'is-current' : ''} ${i < furthest || i === step ? 'is-done' : ''}`}
                disabled={i > furthest}
                onClick={() => goTo(i)}
                aria-current={i === step ? 'step' : undefined}
                aria-label={qq ? `Pregunta ${i + 1}: ${qq.resumen}` : 'Resumen de respuestas'}
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
            <p>Estamos reconstruyendo tu historia…</p>
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
  if (q.requerido && !v) return { ok: false, error: 'Escribe un nombre o un apodo para continuar.' };
  if (q.tipo === 'fecha') {
    if (!v) return { ok: true, value: '' };
    const f = parseCumpleanos(v);
    if (!f) return { ok: false, error: 'Escribe el día y el mes, por ejemplo 14/08 o 14 de agosto, o deja la pregunta sin responder.' };
    return { ok: true, value: f };
  }
  if (q.tipo === 'number') {
    if (!v) return { ok: true, value: null };
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 120)
      return { ok: false, error: 'Escribe una edad entre 1 y 120, o deja la pregunta sin responder.' };
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
        <button type="submit" className="question__go" aria-label="Continuar">
          <ArrowRight size={20} aria-hidden />
        </button>
      </div>
      )}
      <p id={`ayuda-${q.key}`} className="question__help">
        {q.ayuda} {q.requerido ? '' : <span className="question__optional">(Opcional)</span>}
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
          <ArrowLeft size={14} aria-hidden /> Atrás
        </button>
        {!q.requerido && (
          <button type="button" className="link-btn" onClick={() => leave(onSkip)}>
            Omitir esta pregunta
          </button>
        )}
        <span className="question__kbd" aria-hidden>
          Pulsa <kbd>Enter</kbd> para continuar
        </span>
      </div>
    </motion.form>
  );
}
