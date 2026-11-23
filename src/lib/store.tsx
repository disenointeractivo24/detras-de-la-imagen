import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { demoMemories, demoProfile, generateBiography, newSeed, translateMemories, visualStateFor } from './content';
import { setCurrentLang, t, translateHito, type Lang } from './i18n';
import type { Evaluation, ExperienceState, Phase, Profile } from './types';

const STORAGE_KEY = 'detras-de-la-imagen:v1';

export const emptyProfile: Profile = {
  nombre: '',
  edad: null,
  cumpleanos: '',
  ciudadNacimiento: '',
  ciudadActual: '',
  interes: '',
  hito: '',
};

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const initialState: ExperienceState = {
  version: 1,
  phase: 'intro',
  profile: emptyProfile,
  memories: [],
  seed: 1,
  demo: false,
  currentStage: '',
  comparisonPosition: 50,
  selectedComparisonId: null,
  reducedMotion: !!prefersReduced,
  lang: 'ru',
};

type Action =
  | { type: 'setProfile'; profile: Profile }
  | { type: 'generate' }
  | { type: 'loadDemo' }
  | { type: 'setPhase'; phase: Phase }
  | { type: 'evaluate'; id: string; evaluation: Evaluation }
  | { type: 'correct'; id: string; correction: string }
  | { type: 'draw'; id: string; drawing: string }
  | { type: 'strike'; id: string; word: number }
  | { type: 'erase'; id: string; layer: string; on: boolean }
  | { type: 'setStage'; stage: string }
  | { type: 'setComparison'; position: number }
  | { type: 'selectComparison'; id: string | null }
  | { type: 'setReducedMotion'; value: boolean }
  | { type: 'setLang'; lang: Lang }
  | { type: 'reset' };

function reducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profile: action.profile };
    case 'generate': {
      const seed = newSeed();
      return {
        ...state,
        seed,
        demo: false,
        memories: generateBiography(state.profile, seed, state.lang),
        phase: 'reconstruccion',
        currentStage: '',
        selectedComparisonId: null,
        comparisonPosition: 50,
      };
    }
    case 'loadDemo':
      return {
        ...initialState,
        reducedMotion: state.reducedMotion,
        lang: state.lang,
        demo: true,
        phase: 'reconstruccion',
        profile: demoProfile(state.lang),
        memories: demoMemories(state.lang),
      };
    case 'setPhase':
      return { ...state, phase: action.phase };
    case 'evaluate':
      return {
        ...state,
        memories: state.memories.map((m) => {
          if (m.id !== action.id) return m;
          // Si la persona deja de rechazar el recuerdo, su corrección se conserva
          // por si vuelve a rechazarlo, pero ya no reemplaza al texto original.
          return { ...m, evaluation: action.evaluation, visualState: visualStateFor(action.evaluation, m.correction) };
        }),
      };
    case 'correct':
      return {
        ...state,
        memories: state.memories.map((m) =>
          m.id === action.id
            ? { ...m, correction: action.correction, visualState: visualStateFor(m.evaluation, action.correction) }
            : m,
        ),
      };
    case 'draw':
      return { ...state, memories: state.memories.map((m) => (m.id === action.id ? { ...m, drawing: action.drawing } : m)) };
    case 'erase':
      return {
        ...state,
        memories: state.memories.map((m) => {
          if (m.id !== action.id) return m;
          const set = new Set(m.erased ?? []);
          if (action.on) set.add(action.layer);
          else set.delete(action.layer);
          return { ...m, erased: [...set] };
        }),
      };
    case 'strike':
      return {
        ...state,
        memories: state.memories.map((m) => {
          if (m.id !== action.id) return m;
          const set = new Set(m.struck ?? []);
          if (set.has(action.word)) set.delete(action.word);
          else set.add(action.word);
          return { ...m, struck: [...set] };
        }),
      };
    case 'setStage':
      return state.currentStage === action.stage ? state : { ...state, currentStage: action.stage };
    case 'setComparison':
      return { ...state, comparisonPosition: Math.max(0, Math.min(100, action.position)) };
    case 'selectComparison':
      return { ...state, selectedComparisonId: action.id };
    case 'setReducedMotion':
      return { ...state, reducedMotion: action.value };
    case 'setLang': {
      if (action.lang === state.lang) return state;
      // La biografía ya generada se traduce conservando las decisiones de la persona.
      const profile = state.demo
        ? demoProfile(action.lang)
        : { ...state.profile, hito: translateHito(state.profile.hito, action.lang) };
      return {
        ...state,
        lang: action.lang,
        profile,
        memories: translateMemories(state.memories, profile, state.seed, state.demo, action.lang),
      };
    }
    case 'reset':
      return { ...initialState, reducedMotion: state.reducedMotion, lang: state.lang };
  }
}

function load(): ExperienceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as ExperienceState;
    if (parsed.version !== 1) return initialState;
    // La experiencia siempre empieza en la portada. El ejemplo no se conserva (se puede volver a abrir);
    // una biografía propia sí, y la portada ofrece continuarla.
    if (parsed.demo) return { ...initialState, reducedMotion: parsed.reducedMotion ?? initialState.reducedMotion, lang: parsed.lang ?? 'ru' };
    const phase: Phase = 'intro';
    return { ...initialState, ...parsed, lang: parsed.lang ?? 'ru', profile: { ...emptyProfile, ...parsed.profile }, phase };
  } catch {
    return initialState;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

interface Ctx {
  state: ExperienceState;
  dispatch: React.Dispatch<Action>;
}

const ExperienceContext = createContext<Ctx | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  // El idioma se fija antes de que rendericen los hijos, para que t() lo lea.
  setCurrentLang(state.lang);

  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.title = t('По ту сторону кадра', 'Detrás de la imagen');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        t(
          'По ту сторону кадра: интерактивный опыт о жизни, которую ИИ думает, что знает.',
          'Detrás de la imagen: una experiencia interactiva sobre una vida que la IA cree conocer.',
        ),
      );
  }, [state.lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* modo privado o almacenamiento lleno: la experiencia sigue funcionando */
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', state.reducedMotion);
  }, [state.reducedMotion]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('useExperience debe usarse dentro de ExperienceProvider');
  return ctx;
}
