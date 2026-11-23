/**
 * Datos del zodiaco. Las frases están escritas a propósito como afirmaciones
 * vagas y halagadoras (efecto Barnum): casi cualquier persona puede sentirse
 * identificada. Por eso, a veces, "coinciden".
 */

export type Elemento = 'fuego' | 'tierra' | 'aire' | 'agua';

export interface Signo {
  nombre: string;
  elemento: Elemento;
  /** Rasgo de infancia, en segunda persona y pasado: "no tenías paciencia…". */
  nino: string;
  /** Rasgo del presente, en segunda persona: "te lanzas a lo nuevo…". */
  adulto: string;
}

const SIGNOS: (Signo & { desde: [number, number] })[] = [
  { nombre: 'Capricornio', elemento: 'tierra', desde: [12, 22], nino: 'parecías mayor de lo que eras', adulto: 'te tomas en serio tus metas, incluso cuando nadie te está mirando' },
  { nombre: 'Acuario', elemento: 'aire', desde: [1, 20], nino: 'inventabas reglas nuevas para los juegos de siempre', adulto: 'piensas distinto y no te molesta que se note' },
  { nombre: 'Piscis', elemento: 'agua', desde: [2, 19], nino: 'te perdías durante horas en historias que solo existían en tu cabeza', adulto: 'tienes una sensibilidad que pocas personas llegan a ver' },
  { nombre: 'Aries', elemento: 'fuego', desde: [3, 21], nino: 'no tenías paciencia para esperar tu turno', adulto: 'te lanzas a lo nuevo antes de que los demás terminen de pensarlo' },
  { nombre: 'Tauro', elemento: 'tierra', desde: [4, 20], nino: 'defendías tus cosas y tus rutinas como si fueran un tesoro', adulto: 'valoras la calma, los pequeños placeres y a las personas que se quedan' },
  { nombre: 'Géminis', elemento: 'aire', desde: [5, 21], nino: 'hacías mil preguntas y cambiabas de juego cada cinco minutos', adulto: 'tienes conversación para todo y la monotonía te pesa más que a otros' },
  { nombre: 'Cáncer', elemento: 'agua', desde: [6, 21], nino: 'guardabas objetos pequeños solo por lo que significaban para ti', adulto: 'proteges a los tuyos, aunque a veces olvidas cuidarte a ti' },
  { nombre: 'Leo', elemento: 'fuego', desde: [7, 23], nino: 'te encantaba que te miraran cuando hacías algo bien', adulto: 'te cuesta pasar desapercibido, y en el fondo no quieres hacerlo' },
  { nombre: 'Virgo', elemento: 'tierra', desde: [8, 23], nino: 'ordenabas tus colores por tonos sin que nadie te lo pidiera', adulto: 'notas los detalles que a los demás se les escapan' },
  { nombre: 'Libra', elemento: 'aire', desde: [9, 23], nino: 'intentabas que todos en el juego quedaran contentos', adulto: 'buscas el equilibrio y te cuesta decir que no' },
  { nombre: 'Escorpio', elemento: 'agua', desde: [10, 23], nino: 'observabas en silencio antes de confiar en alguien', adulto: 'sientes con intensidad, aunque no siempre lo muestres' },
  { nombre: 'Sagitario', elemento: 'fuego', desde: [11, 22], nino: 'querías saber qué había al final de cada calle', adulto: 'necesitas sentir que todavía quedan lugares por descubrir' },
];

export const ELEMENTO_ADOLESCENCIA: Record<Elemento, string> = {
  fuego: 'defendías con pasión ideas que hoy te parecen pequeñas',
  tierra: 'eras quien mantenía la calma cuando todo a tu alrededor se desordenaba',
  aire: 'tenías amigos en todos los grupos, pero no pertenecías del todo a ninguno',
  agua: 'te emocionabas con las películas aunque intentaras disimularlo',
};

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Interpreta "14/08", "14-8", "14 8" o "14 de agosto".
 * Devuelve "DD/MM" normalizado o null si no es una fecha válida.
 */
export function parseCumpleanos(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  let d: number | null = null;
  let m: number | null = null;
  const num = t.match(/^(\d{1,2})\s*[/\-. ]\s*(\d{1,2})$/);
  if (num) {
    d = Number(num[1]);
    m = Number(num[2]);
  } else {
    const txt = t.match(/^(\d{1,2})\s*(?:de\s+)?([a-záéíóú]+)$/);
    if (txt) {
      d = Number(txt[1]);
      const idx = MESES.findIndex((mm) => mm.startsWith(txt[2].slice(0, 3)));
      m = idx >= 0 ? idx + 1 : null;
    }
  }
  if (!d || !m || m < 1 || m > 12 || d < 1 || d > DIAS_MES[m - 1]) return null;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

export function signoDe(cumple: string): Signo | null {
  const ok = parseCumpleanos(cumple);
  if (!ok) return null;
  const [d, m] = ok.split('/').map(Number);
  // El signo empieza en `desde`; antes de esa fecha pertenece al signo anterior.
  const idx = SIGNOS.findIndex((s) => s.desde[0] === m);
  const actual = SIGNOS[idx];
  const signo = d >= actual.desde[1] ? actual : SIGNOS[(idx + SIGNOS.length - 1) % SIGNOS.length];
  return { nombre: signo.nombre, elemento: signo.elemento, nino: signo.nino, adulto: signo.adulto };
}

/** "14 de agosto" */
export function fechaLarga(cumple: string): string | null {
  const ok = parseCumpleanos(cumple);
  if (!ok) return null;
  const [d, m] = ok.split('/').map(Number);
  return `${d} de ${MESES[m - 1]}`;
}
