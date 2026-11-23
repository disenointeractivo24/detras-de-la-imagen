/* ==========================================================================
   IDIOMA
   La experiencia existe en ruso (escenario Moscú 2050) y en español.
   El idioma activo vive en el estado (store) y se copia aquí en cada render,
   así cualquier texto puede pedirse con t('ruso', 'español').
   ========================================================================== */

export type Lang = 'ru' | 'es';

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'es', label: 'ES', name: 'Español' },
];

let current: Lang = 'ru';

export function setCurrentLang(lang: Lang) {
  current = lang;
}

export function getLang(): Lang {
  return current;
}

/** Devuelve el texto en el idioma activo. */
export function t<T = string>(ru: T, es: T): T {
  return current === 'es' ? es : ru;
}

/** Opciones del «momento importante»: mismo orden en ambos idiomas para poder traducir la respuesta. */
export const HITOS: Record<Lang, string[]> = {
  ru: ['Мой выпускной', 'Когда я переехал', 'Одно путешествие', 'Когда я кого-то встретил', 'Когда я кого-то потерял', 'Моя первая работа'],
  es: ['El día de mi grado', 'Cuando me mudé', 'Un viaje', 'Cuando conocí a alguien', 'Cuando perdí a alguien', 'Mi primer trabajo'],
};

/** Traduce la respuesta del «momento importante» si es una de las opciones. */
export function translateHito(hito: string, to: Lang): string {
  const from: Lang = to === 'es' ? 'ru' : 'es';
  const i = HITOS[from].indexOf(hito);
  return i >= 0 ? HITOS[to][i] : hito;
}

/**
 * Grupos de intereses (música, deporte, dibujo…), con palabras clave en ambos idiomas.
 * Los dos idiomas usan el mismo grupo para que una biografía elija las mismas fotos
 * y los mismos recuerdos en ruso y en español.
 */
const INTEREST_KEYS: string[][] = [
  ['música', 'musica', 'cantar', 'guitarra', 'piano', 'canto', 'banda', 'rap', 'dj', 'музык', 'петь', 'пени', 'гитар', 'пианино', 'рок', 'рэп'],
  ['fútbol', 'futbol', 'deporte', 'baloncesto', 'correr', 'natación', 'tenis', 'voleibol', 'ciclismo', 'gimnasio', 'футбол', 'спорт', 'баскетбол', 'бег', 'плаван', 'теннис', 'волейбол', 'велосипед', 'зал'],
  ['dibujo', 'dibujar', 'arte', 'pintura', 'pintar', 'diseño', 'ilustración', 'ilustracion', 'dibuj', 'рис', 'искусств', 'живопис', 'дизайн', 'иллюстрац'],
  ['leer', 'lectura', 'libros', 'escribir', 'escritura', 'literatura', 'poesía', 'poesia', 'чит', 'книг', 'писа', 'литератур', 'поэз', 'стих'],
  ['tecnología', 'tecnologia', 'programación', 'programacion', 'computador', 'videojuegos', 'ciencia', 'robótica', 'código', 'технолог', 'программ', 'компьютер', 'игр', 'наук', 'робот', 'код'],
  ['fotografía', 'fotografia', 'fotos', 'cámara', 'camara', 'фото', 'камер'],
  ['cine', 'películas', 'peliculas', 'video', 'teatro', 'actuación', 'series', 'кино', 'фильм', 'видео', 'театр', 'сериал'],
  ['naturaleza', 'viajar', 'viajes', 'montaña', 'animales', 'senderismo', 'mar', 'природ', 'путешеств', 'гор', 'животн', 'поход', 'мор'],
  ['cocina', 'cocinar', 'comida', 'repostería', 'reposteria', 'кухн', 'готов', 'еда', 'выпечк'],
  ['baile', 'bailar', 'danza', 'танц'],
];

/** Índice del grupo de interés, o -1 si no coincide con ninguno. */
export function interestGroup(interes: string): number {
  const lower = interes.trim().toLowerCase();
  if (!lower) return -1;
  return INTEREST_KEYS.findIndex((keys) => keys.some((k) => lower.includes(k)));
}
