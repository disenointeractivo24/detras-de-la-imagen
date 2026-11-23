/**
 * Motor narrativo local.
 * Genera una biografía plausible a partir de los pocos datos que la persona
 * decidió compartir y de plantillas predefinidas. No consulta ningún servicio
 * externo: todo lo que no fue aportado es una suposición de la simulación.
 */
import { ART_POOL, BANK, IMAGE_ALT, STAGE_IMAGES, type Ctx, type Entry, type InterestVocab } from './memoryBank';
import type { Evaluation, LifeStage, Memory, MemoryKind, Profile, VisualState } from './types';
import { fechaLarga } from './zodiac';
import { interestGroup } from './i18n';
import { ru } from './visual';

const CURRENT_YEAR = new Date().getFullYear();


const VOCAB: { claves: string[]; v: Omit<InterestVocab, 'tema'> }[] = [
  {
    claves: ['музык', 'петь', 'пени', 'гитар', 'пианино', 'рок', 'рэп', 'dj', 'música', 'musica'],
    v: { practica: 'подбирать песни на слух', objeto: 'старую гитару, которую кто-то оставил дома', gerundio: 'слушал пластинки и разучивал песни', imagenes: ['sala-musica', 'tocadiscos', 'habitacion-adolescente'] },
  },
  {
    claves: ['футбол', 'спорт', 'баскетбол', 'бег', 'плаван', 'теннис', 'волейбол', 'велосипед', 'зал', 'fútbol', 'futbol'],
    v: { practica: 'тренироваться до темноты', objeto: 'потёртый мяч, который был с тобой повсюду', gerundio: 'тренировался', imagenes: ['cancha', 'futbol-joven'] },
  },
  {
    claves: ['рис', 'искусств', 'живопис', 'дизайн', 'иллюстрац', 'dibuj', 'diseño'],
    v: { practica: 'заполнять тетради рисунками', objeto: 'коробку цветных карандашей', gerundio: 'рисовал', imagenes: ['cuaderno-escritorio', 'cuaderno', 'habitacion-infantil'] },
  },
  {
    claves: ['чит', 'книг', 'писа', 'литератур', 'поэз', 'стих'],
    v: { practica: 'читать допоздна с фонариком', objeto: 'книгу, которую ты перечитал столько раз, что она развалилась', gerundio: 'читал и писал', imagenes: ['cuaderno-escritorio', 'escritorio'] },
  },
  {
    claves: ['технолог', 'программ', 'компьютер', 'игр', 'наук', 'робот', 'код'],
    v: { practica: 'разбирать приборы, чтобы понять, как они работают', objeto: 'старый медленный компьютер', gerundio: 'сидел перед экраном', imagenes: ['cuaderno', 'escritorio', 'habitacion-adolescente'] },
  },
  {
    claves: ['фото', 'камер'],
    v: { practica: 'фотографировать всё вокруг', objeto: 'чужую фотокамеру', gerundio: 'проявлял фотографии', imagenes: ['sala-album', 'escritorio'] },
  },
  {
    claves: ['кино', 'фильм', 'видео', 'театр', 'сериал'],
    v: { practica: 'снимать маленькие истории на то, что было под рукой', objeto: 'чужую видеокамеру', gerundio: 'смотрел фильмы', imagenes: ['habitacion-adolescente', 'escritorio'] },
  },
  {
    claves: ['природ', 'путешеств', 'гор', 'животн', 'поход', 'мор'],
    v: { practica: 'исследовать места, куда никто не хотел идти', objeto: 'карту, сложенную тысячу раз', gerundio: 'планировал путешествия', imagenes: ['niebla', 'parque-vacio', 'calle-barrio'] },
  },
  {
    claves: ['кухн', 'готов', 'еда', 'выпечк'],
    v: { practica: 'придумывать рецепты на кухне', objeto: 'тетрадь с бабушкиными рецептами', gerundio: 'готовил', imagenes: ['sala-album', 'cumpleanos'] },
  },
  {
    claves: ['танц'],
    v: { practica: 'танцевать перед зеркалом', objeto: 'старый плеер', gerundio: 'разучивал движения', imagenes: ['sala-musica', 'tocadiscos'] },
  },
];

function vocabFor(interes: string): InterestVocab {
  const limpio = interes.trim();
  const lower = limpio.toLowerCase();
  // El grupo se busca con palabras clave de ambos idiomas (ver i18n.ts).
  const match = VOCAB[interestGroup(limpio)];
  // El interés se usa siempre entre comillas y en nominativo, tal como lo escribió la persona.
  const tema = limpio ? lower.replace(/[«»"]/g, '') : 'то, что ты любил';
  if (match) return { tema, ...match.v };
  return {
    tema,
    practica: 'терять счёт времени за любимым делом',
    objeto: 'маленькую вещь, которую ты хранишь до сих пор',
    gerundio: 'думал об этом',
    imagenes: ['habitacion-adolescente', 'escritorio', 'cuaderno-escritorio'],
  };
}

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Ajusta las edades típicas de cada etapa a la edad real (si se conoce). */
function edadAprox(deseada: number, edad: number | null): number | null {
  if (edad === null) return null;
  const factor = Math.min(1, edad / 20);
  return Math.max(1, Math.min(edad, Math.round(deseada * factor)));
}

export function visualStateFor(evaluation: Evaluation, _correction: string): VisualState {
  switch (evaluation) {
    case 'confirmado':
      return 'reconocido';
    case 'rechazado':
      return 'vacio';
    case 'incierto':
      return 'incierto';
    default:
      return 'completo';
  }
}

/** Frases de apertura: solo usan datos aportados por la persona. */
export function introLines(p: Profile): string[] {
  const lines = [p.nombre ? `Это твоя история, ${p.nombre}.` : 'Это твоя история.'];
  if (p.ciudadNacimiento) {
    lines.push(`Ты родился в городе ${capitalizar(p.ciudadNacimiento.trim())} и рос среди событий, которые определили твой взгляд на мир.`);
  } else {
    lines.push('Ты рос среди событий, которые определили твой взгляд на мир.');
  }
  const fecha = fechaLarga(p.cumpleanos);
  if (fecha) lines.push(`Ты родился ${fecha}.`);
  if (p.edad !== null) lines.push(`Сегодня тебе ${ru(p.edad, 'год', 'года', 'лет')}.`);
  return lines;
}

/** Generador pseudoaleatorio (mulberry32). La semilla se guarda para poder reconstruir la partida. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed() {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  } catch {
    return Math.floor(Math.random() * 2 ** 32);
  }
}

function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STAGE_ORDER: LifeStage[] = ['infancia', 'adolescencia', 'decisiones', 'presente'];
const PER_STAGE = 2;

/**
 * Genera una biografía distinta en cada partida: elige al azar plantillas del
 * banco y fotografías candidatas. Lo aportado por la persona (interés, ciudad,
 * hito, cumpleaños) casi siempre aparece, pero reinterpretado.
 */
export function generateBiography(p: Profile, seed: number = newSeed()): Memory[] {
  const r = rng(seed);
  const origen = p.ciudadNacimiento ? capitalizar(p.ciudadNacimiento.trim()) : null;
  const actual = p.ciudadActual ? capitalizar(p.ciudadActual.trim()) : '';
  const ctx: Ctx = {
    p,
    v: vocabFor(p.interes),
    origen,
    actual,
    misma: !actual || actual.toLowerCase() === (origen ?? '').toLowerCase(),
    sinCiudades: !p.ciudadNacimiento && !p.ciudadActual,
    nombre: p.nombre.trim(),
    fecha: fechaLarga(p.cumpleanos),
    enAnios: (age, fallback) => (age === null ? fallback : `В ${ru(age, 'год', 'года', 'лет')}`),
    anios: (age) => ru(age, 'год', 'года', 'лет'),
    capitalizar,
  };

  const available = BANK.filter((e) => !e.when || e.when(ctx));
  const chosen: Record<LifeStage, Entry[]> = { infancia: [], adolescencia: [], decisiones: [], presente: [] };
  const take = (e: Entry | undefined) => {
    if (e && chosen[e.stage].length < PER_STAGE && !chosen[e.stage].includes(e)) chosen[e.stage].push(e);
  };
  const ofKind = (kind: MemoryKind, stage?: LifeStage) =>
    shuffle(available.filter((e) => e.kind === kind && (!stage || e.stage === stage)), r);

  // 1) Lo que la persona contó casi siempre aparece… reinterpretado.
  take(ofKind('hito')[0]);
  if (p.interes) take(ofKind('interes', r() < 0.5 ? 'infancia' : 'adolescencia')[0]);
  if (p.interes && r() < 0.35) take(ofKind('interes', 'presente')[0]);
  if (!ctx.sinCiudades && r() < 0.75) take(ofKind('ciudad')[0]);
  // 3) Se completa con una mezcla de frases vagas y hechos concretos.
  for (const stage of STAGE_ORDER) {
    let guard = 0;
    while (chosen[stage].length < PER_STAGE && guard++ < 20) {
      const hasBarnum = chosen[stage].some((e) => e.kind === 'barnum');
      const prefer: MemoryKind = hasBarnum ? 'especifico' : r() < 0.6 ? 'barnum' : 'especifico';
      const pool = ofKind(prefer, stage).filter((e) => !chosen[stage].includes(e));
      const fallback = shuffle(
        available.filter((e) => e.stage === stage && !chosen[stage].includes(e) && e.kind !== 'signo'),
        r,
      );
      take(pool[0] ?? fallback[0]);
    }
  }

  // 4) Fotografías: se reparten al azar evitando repetir.
  const used = new Set<string>();
  const pickImage = (e: Entry) => {
    const list = typeof e.images === 'function' ? e.images(ctx) : e.images;
    const free =
      shuffle(list, r).find((i) => !used.has(i)) ??
      shuffle(STAGE_IMAGES[e.stage], r).find((i) => !used.has(i)) ??
      list[0];
    used.add(free);
    return free;
  };

  const ageOf = (e: Entry): number | null => {
    if (p.edad === null) return null;
    if (e.age <= 0) return Math.max(1, p.edad + e.age);
    // Pequeña variación para que las edades no sean siempre las mismas.
    const jitter = Math.round((r() - 0.5) * 2);
    return edadAprox(e.age + jitter, p.edad);
  };

  const memories: Memory[] = [];
  for (const stage of STAGE_ORDER) {
    const items = chosen[stage]
      .map((e) => ({ e, age: ageOf(e) }))
      .sort((a, b) => (a.age ?? a.e.age) - (b.age ?? b.e.age));
    items.forEach(({ e, age }, i) => {
      const image = pickImage(e);
      memories.push({
        id: `${stage}-${i + 1}`,
        stage,
        kind: e.kind,
        approxAge: age,
        approxYear: age === null || p.edad === null ? null : CURRENT_YEAR - p.edad + age,
        title: typeof e.title === 'function' ? e.title(ctx) : e.title,
        statement: capitalizar(e.text(ctx, age)),
        image,
        imageAlt: `${IMAGE_ALT[image] ?? 'Фотография'} (иллюстрация).`,
        origin: e.kind === 'barnum' || e.kind === 'especifico' ? 'especulativo' : 'inferido',
        speculative: true,
        evaluation: 'pendiente',
        correction: '',
        visualState: 'completo',
      });
    });
  }
  return memories;
}

/** Portada y foto frontal de cada capítulo, elegidas al azar sin repetir las de los recuerdos. */
export function chapterArt(stage: LifeStage, seed: number, memories: Memory[]) {
  const r = rng(seed + STAGE_ORDER.indexOf(stage) * 101);
  const used = new Set(memories.map((m) => m.image));
  const pool = ART_POOL[stage];
  const cover = shuffle(pool.cover, r).find((i) => !used.has(i)) ?? pool.cover[0];
  const front = shuffle(pool.front, r).find((i) => !used.has(i) && i !== cover) ?? pool.front[0];
  return { cover, front };
}


export interface Stats {
  total: number;
  revisados: number;
  confirmados: number;
  rechazados: number;
  inciertos: number;
  corregidos: number;
  pendientes: number;
}

export function computeStats(memories: Memory[]): Stats {
  const count = (e: Evaluation) => memories.filter((m) => m.evaluation === e).length;
  const pendientes = count('pendiente');
  return {
    total: memories.length,
    revisados: memories.length - pendientes,
    confirmados: count('confirmado'),
    rechazados: count('rechazado'),
    inciertos: count('incierto'),
    corregidos: memories.filter((m) => m.evaluation === 'rechazado' && m.correction.trim()).length,
    pendientes,
  };
}

export { ru as plural } from './visual';
