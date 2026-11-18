/**
 * Motor narrativo local.
 * Genera una biografía plausible a partir de los pocos datos que la persona
 * decidió compartir y de plantillas predefinidas. No consulta ningún servicio
 * externo: todo lo que no fue aportado es una suposición de la simulación.
 */
import { ART_POOL, BANK, IMAGE_ALT, STAGE_IMAGES, type Ctx, type Entry, type InterestVocab } from './memoryBank';
import type { Evaluation, LifeStage, Memory, MemoryKind, Profile, VisualState } from './types';
import { fechaLarga } from './zodiac';

const CURRENT_YEAR = new Date().getFullYear();


const VOCAB: { claves: string[]; v: Omit<InterestVocab, 'tema'> }[] = [
  {
    claves: ['música', 'musica', 'cantar', 'guitarra', 'piano', 'canto', 'banda', 'rap', 'dj'],
    v: { practica: 'tocar canciones de oído', objeto: 'una guitarra vieja que alguien dejó en casa', gerundio: 'escuchando discos y aprendiendo canciones', imagenes: ['sala-musica', 'tocadiscos', 'habitacion-adolescente'] },
  },
  {
    claves: ['fútbol', 'futbol', 'deporte', 'baloncesto', 'correr', 'natación', 'tenis', 'voleibol', 'ciclismo', 'gimnasio'],
    v: { practica: 'entrenar hasta que oscurecía', objeto: 'un balón gastado que te acompañaba a todas partes', gerundio: 'entrenando', imagenes: ['cancha', 'futbol-joven'] },
  },
  {
    claves: ['dibujo', 'dibujar', 'arte', 'pintura', 'pintar', 'diseño', 'ilustración', 'ilustracion'],
    v: { practica: 'llenar cuadernos de dibujos', objeto: 'una caja de lápices de colores', gerundio: 'dibujando', imagenes: ['cuaderno-escritorio', 'cuaderno', 'habitacion-infantil'] },
  },
  {
    claves: ['leer', 'lectura', 'libros', 'escribir', 'escritura', 'literatura', 'poesía', 'poesia'],
    v: { practica: 'leer hasta tarde con una linterna', objeto: 'un libro que leíste tantas veces que se deshizo', gerundio: 'leyendo y escribiendo', imagenes: ['cuaderno-escritorio', 'escritorio'] },
  },
  {
    claves: ['tecnología', 'tecnologia', 'programación', 'programacion', 'computador', 'videojuegos', 'ciencia', 'robótica', 'código'],
    v: { practica: 'desarmar aparatos para entender cómo funcionaban', objeto: 'un computador antiguo y lento', gerundio: 'frente a una pantalla', imagenes: ['cuaderno', 'escritorio', 'habitacion-adolescente'] },
  },
  {
    claves: ['fotografía', 'fotografia', 'fotos', 'cámara', 'camara'],
    v: { practica: 'fotografiar todo lo que veías', objeto: 'una cámara prestada', gerundio: 'revelando fotografías', imagenes: ['sala-album', 'escritorio'] },
  },
  {
    claves: ['cine', 'películas', 'peliculas', 'video', 'teatro', 'actuación', 'series'],
    v: { practica: 'grabar pequeñas historias con lo que tenías a mano', objeto: 'una cámara prestada', gerundio: 'viendo películas', imagenes: ['habitacion-adolescente', 'escritorio'] },
  },
  {
    claves: ['naturaleza', 'viajar', 'viajes', 'montaña', 'animales', 'senderismo', 'mar'],
    v: { practica: 'explorar lugares a los que nadie más quería ir', objeto: 'un mapa doblado mil veces', gerundio: 'planeando viajes', imagenes: ['niebla', 'parque-vacio', 'calle-barrio'] },
  },
  {
    claves: ['cocina', 'cocinar', 'comida', 'repostería', 'reposteria'],
    v: { practica: 'inventar recetas en la cocina', objeto: 'un cuaderno de recetas heredado', gerundio: 'cocinando', imagenes: ['sala-album', 'cumpleanos'] },
  },
  {
    claves: ['baile', 'bailar', 'danza'],
    v: { practica: 'bailar frente al espejo', objeto: 'un viejo reproductor de música', gerundio: 'ensayando pasos', imagenes: ['sala-musica', 'tocadiscos'] },
  },
];

function vocabFor(interes: string): InterestVocab {
  const limpio = interes.trim();
  const lower = limpio.toLowerCase();
  const match = VOCAB.find((g) => g.claves.some((c) => lower.includes(c)));
  const tema = limpio ? temaConArticulo(limpio) : 'aquello que te apasionaba';
  if (match) return { tema, ...match.v };
  return {
    tema,
    practica: 'perder la noción del tiempo con lo que te gustaba',
    objeto: 'un objeto pequeño que todavía conservas',
    gerundio: 'pensando en ello',
    imagenes: ['habitacion-adolescente', 'escritorio', 'cuaderno-escritorio'],
  };
}

const VERBOS: Record<string, string> = {
  dibujar: 'el dibujo',
  pintar: 'la pintura',
  leer: 'la lectura',
  escribir: 'la escritura',
  cocinar: 'la cocina',
  bailar: 'el baile',
  cantar: 'el canto',
  viajar: 'los viajes',
  programar: 'la programación',
  correr: 'el atletismo',
  nadar: 'la natación',
  actuar: 'la actuación',
  diseñar: 'el diseño',
  fotografiar: 'la fotografía',
  jugar: 'el juego',
};

function temaConArticulo(texto: string): string {
  const t = texto.trim();
  const lower = t.toLowerCase();
  if (/^(el|la|los|las|un|una)\s/.test(lower)) return lower;
  // Verbos ("dibujar") → sustantivo natural ("el dibujo"); si no lo conocemos, "el gusto por…".
  if (/(ar|er|ir)$/.test(lower)) return VERBOS[lower] ?? `el gusto por ${lower}`;
  if (/(a|ión|dad|tud)$/.test(lower) && !/(ma|ta)$/.test(lower)) return `la ${lower}`;
  if (/s$/.test(lower)) return `los ${lower}`;
  return `el ${lower}`;
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
  const lines = [`Esta es la historia de ${p.nombre || 'alguien'}.`];
  if (p.ciudadNacimiento) {
    lines.push(`Naciste en ${capitalizar(p.ciudadNacimiento.trim())} y creciste entre experiencias que marcaron tu manera de ver el mundo.`);
  } else {
    lines.push('Creciste entre experiencias que marcaron tu manera de ver el mundo.');
  }
  const fecha = fechaLarga(p.cumpleanos);
  if (fecha) lines.push(`Naciste un ${fecha}.`);
  if (p.edad !== null) lines.push(`Hoy tienes ${p.edad} años.`);
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
  const origen = p.ciudadNacimiento ? capitalizar(p.ciudadNacimiento.trim()) : 'tu ciudad natal';
  const actual = p.ciudadActual ? capitalizar(p.ciudadActual.trim()) : '';
  const ctx: Ctx = {
    p,
    v: vocabFor(p.interes),
    origen,
    actual,
    misma: !actual || actual.toLowerCase() === origen.toLowerCase(),
    sinCiudades: !p.ciudadNacimiento && !p.ciudadActual,
    nombre: p.nombre.trim(),
    signo: null,
    fecha: fechaLarga(p.cumpleanos),
    enAnios: (age, fallback) => (age === null ? fallback : `A los ${age} años`),
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
        imageAlt: `${IMAGE_ALT[image] ?? 'Fotografía'} (imagen ilustrativa).`,
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

export function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`;
}
