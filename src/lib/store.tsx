import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEMO_PROFILE, demoMemories } from './demo';
import { generateBiography, newSeed, visualStateFor } from './narrative';
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
        memories: generateBiography(state.profile, seed),
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
        demo: true,
        phase: 'reconstruccion',
        profile: DEMO_PROFILE,
        memories: demoMemories(),
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
    case 'reset':
      return { ...initialState, reducedMotion: state.reducedMotion };
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
    if (parsed.demo) return { ...initialState, reducedMotion: parsed.reducedMotion ?? initialState.reducedMotion };
    const phase: Phase = 'intro';
    return { ...initialState, ...parsed, profile: { ...emptyProfile, ...parsed.profile }, phase };
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
