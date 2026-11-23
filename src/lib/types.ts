import { t, type Lang } from './i18n';

export type LifeStage = 'infancia' | 'adolescencia' | 'decisiones' | 'presente';

/** De dónde sale la información del recuerdo. */
export type InformationOrigin =
  | 'aportado' // dato que la persona escribió
  | 'inferido' // deducción plausible a partir de un dato aportado
  | 'especulativo'; // acontecimiento inventado por la simulación

/** Familia de plantilla de la que salió el recuerdo (uso interno, nunca se muestra). */
export type MemoryKind = 'barnum' | 'especifico' | 'interes' | 'ciudad' | 'hito' | 'signo';

export type Evaluation = 'pendiente' | 'confirmado' | 'rechazado' | 'incierto';

export type VisualState = 'completo' | 'reconocido' | 'vacio' | 'corregido' | 'incierto';

export interface Profile {
  nombre: string;
  edad: number | null;
  /** Día y mes de nacimiento, "DD/MM" (opcional; sirve para el signo zodiacal). */
  cumpleanos: string;
  ciudadNacimiento: string;
  ciudadActual: string;
  interes: string;
  hito: string;
}

export interface Memory {
  id: string;
  stage: LifeStage;
  kind?: MemoryKind;
  /** Edad aproximada en la que habría ocurrido (null si no se conoce la edad). */
  approxAge: number | null;
  /** Año aproximado (null si no se conoce la edad). */
  approxYear: number | null;
  title: string;
  statement: string;
  image: string;
  imageAlt: string;
  origin: InformationOrigin;
  speculative: boolean;
  evaluation: Evaluation;
  correction: string;
  visualState: VisualState;
  /** Trazos que la persona dibujó sobre la foto (imagen en data URL). */
  drawing?: string;
  /** Índices de las palabras que la persona tachó en el texto. */
  struck?: number[];
  /** Foto real que hay detrás de una imagen inventada. */
  realImage?: string;
  /** Palabras que, si se tachan, deshacen la parte inventada de la imagen. */
  anchors?: string[];
  /** Partes inventadas que se borran por separado (cada una con sus palabras). */
  layers?: { id: string; anchors: string[]; /** Zona de la foto en % (x, y, ancho, alto) donde se puede tachar. */ region?: [number, number, number, number] }[];
  /** Capas que la persona tachó directamente sobre la foto. */
  erased?: string[];
  /** Imagen para cada combinación de capas que sigue en pie, p. ej. "guitarra+pastel". */
  layerImages?: Record<string, string>;
}

export type Phase = 'intro' | 'reconstruccion' | 'biografia';

export interface ExperienceState {
  version: 1;
  phase: Phase;
  profile: Profile;
  memories: Memory[];
  /** Semilla de la combinación aleatoria de esta partida. */
  seed: number;
  /** true cuando se está viendo el ejemplo de JM. */
  demo: boolean;
  currentStage: string;
  comparisonPosition: number;
  selectedComparisonId: string | null;
  reducedMotion: boolean;
  /** Idioma de la experiencia. */
  lang: Lang;
}

/** Etapas de la vida. Título y lema se leen en el idioma activo. */
const stage = (id: LifeStage, numero: string, titulo: [string, string], lema: [string, string]) => ({
  id,
  numero,
  get titulo() {
    return t(...titulo);
  },
  get lema() {
    return t(...lema);
  },
});

export const STAGES: { id: LifeStage; numero: string; readonly titulo: string; readonly lema: string }[] = [
  stage('infancia', '01', ['Детство', 'Infancia'], ['Первые воспоминания.', 'Los primeros recuerdos.']),
  stage('adolescencia', '02', ['Юность', 'Adolescencia'], ['Годы, которые начали тебя определять.', 'Los años que empezaron a definirte.']),
  stage('decisiones', '03', ['Решения', 'Decisiones'], ['Пути, которые ты выбрал.', 'Los caminos que elegiste.']),
  stage('presente', '04', ['Сейчас', 'Presente'], ['Кем ты стал.', 'En quién te has convertido.']),
];
