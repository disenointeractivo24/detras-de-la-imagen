/**
 * MODO EJEMPLO — la biografía de JM.
 *
 * Mezcla, a propósito, recuerdos que probablemente coinciden con su vida y otros
 * que la "IA" inventó a partir de sus fotos. Tres de ellos pueden ilustrarse con
 * imágenes alteradas por IA (carpeta ../mis-fotos/inventadas, ver PROMPTS-IA.md);
 * mientras no existan, se usa la fotografía real de la que partirían.
 *
 * Las edades salen del nombre de cada archivo en ../mis-fotos (ver jmPhotos.json,
 * generado con `npm run fotos`). Las marcadas con «estimada» son suposiciones.
 */
import photos from './jmPhotos.json';
import type { LifeStage, Memory, Profile } from './types';
import { visualStateFor } from './narrative';

type PhotoInfo = { archivo: string; edad: number | null; anio: number | null };
const manifest = photos as Record<string, PhotoInfo>;

/** Usa la foto inventada si ya fue generada; si no, la real. */
function foto(inventada: string | null, real: string) {
  if (inventada && manifest[`inventadas-${inventada}`]) return `jm/inventadas-${inventada}`;
  return `jm/${real}`;
}

/** Edad escrita en el nombre del archivo, o la estimada si no tiene. */
function edadDe(id: string, estimada: number) {
  return manifest[id]?.edad ?? estimada;
}

export const DEMO_NAME = 'JM';

export const DEMO_PROFILE: Profile = {
  nombre: 'JM',
  edad: 21,
  cumpleanos: '10/05',
  ciudadNacimiento: '', // EDITAR si quieres que aparezca
  ciudadActual: '', // EDITAR si quieres que aparezca
  interes: 'la música',
  hito: 'El día de mi grado',
};

type DemoDraft = Pick<Memory, 'stage' | 'approxAge' | 'title' | 'statement' | 'image' | 'imageAlt' | 'kind' | 'origin' | 'realImage' | 'anchors' | 'layers' | 'layerImages'>;

const DRAFTS: DemoDraft[] = [
  {
    stage: 'infancia',
    approxAge: edadDe('infancia-12', 2),
    title: 'La primera guitarra',
    statement:
      'En tu cumpleaños número 2 hubo un pastel lleno de notas musicales y un letrero que decía «Bienvenidos a mi fiesta». Ese día te regalaron una guitarra de juguete, y desde entonces no la soltaste.',
    image: foto('10-pastel-musical-guitarra', 'infancia-12'),
    realImage: 'jm/infancia-12',
    layers: [
      { id: 'pastel', anchors: ['notas', 'musicales'], region: [22, 61, 76, 39] },
      { id: 'guitarra', anchors: ['guitarra', 'regalaron'], region: [18, 30, 60, 30] },
    ],
    layerImages: {
      'guitarra+pastel': 'jm/inventadas-10-pastel-musical-guitarra',
      guitarra: 'jm/inventadas-02-guitarra-cumpleanos',
      // Si aún no existe la imagen del pastel musical sin guitarra, ese caso muestra la foto real.
      ...(manifest['inventadas-11-pastel-musical-sin-guitarra'] ? { pastel: 'jm/inventadas-11-pastel-musical-sin-guitarra' } : {}),
    },
    imageAlt: 'Un niño pequeño ríe junto a su pastel de cumpleaños.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    // Mismo disfraz amarillo que la foto infancia-20.
    approxAge: 8,
    title: 'El concurso de disfraces',
    statement:
      'Cada octubre esperabas el día de los disfraces. A los 8 años ganaste el concurso del centro comercial y subiste al escenario a recibir el premio frente a todo el público.',
    image: foto('01-concurso', 'infancia-21'),
    realImage: 'jm/infancia-21',
    anchors: ['ganaste', 'concurso', 'premio', 'escenario'],
    imageAlt: 'Un niño disfrazado frente a un micrófono en un centro comercial.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    approxAge: 9,
    title: 'La bicicleta',
    statement:
      'Tu bicicleta era tu forma de escapar. Recorrías el barrio entero con tus amigos y solo volvías a casa cuando ya no se veía nada.',
    image: foto('04-bicicleta-amigos', 'adolescencia-01'),
    realImage: 'jm/adolescencia-01',
    anchors: ['amigos', 'barrio', 'veía'],
    imageAlt: 'Un niño en una bicicleta BMX en una calle.',
    kind: 'barnum',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    approxAge: edadDe('infancia-10', 10),
    title: 'Más alto que las nubes',
    statement:
      'Las vacaciones eran en la montaña. Pasabas horas en el columpio, convencido de que si te impulsabas lo suficiente ibas a tocar el cielo.',
    image: foto('05-columpio-cielo', 'infancia-10'),
    realImage: 'jm/infancia-10',
    anchors: ['cielo', 'tocar', 'impulsabas'],
    imageAlt: 'Un niño en un columpio en medio de un paisaje de montaña.',
    kind: 'barnum',
    origin: 'especulativo',
  },
  {
    stage: 'adolescencia',
    approxAge: 11,
    title: 'El primer escenario',
    statement:
      'A los 11 años tocaste por primera vez frente a todo el colegio. Te temblaban las manos, pero cuando sonó el primer acorde supiste que querías dedicarte a la música.',
    image: foto('03-escenario-colegio', 'adolescencia-03'),
    realImage: 'jm/adolescencia-03',
    anchors: ['tocaste', 'escenario', 'colegio', 'acorde'],
    imageAlt: 'Un adolescente con uniforme escolar.',
    kind: 'interes',
    origin: 'inferido',
  },
  {
    stage: 'decisiones',
    approxAge: edadDe('decisiones-01', 17), // estimada
    title: 'Sin dudar',
    statement:
      'El día de tu grado ya sabías exactamente qué ibas a estudiar. Nunca dudaste de tu decisión, aunque no todos a tu alrededor la entendieron.',
    image: foto('06-grado-toga', 'decisiones-01'),
    realImage: 'jm/decisiones-01',
    anchors: ['sabías', 'estudiar', 'dudaste'],
    imageAlt: 'Un joven con toga de graduación y su diploma, junto a su familia.',
    kind: 'hito',
    origin: 'inferido',
  },
  {
    stage: 'decisiones',
    approxAge: edadDe('decisiones-02', 18),
    title: 'El primer día',
    statement:
      'A los 18 entraste a la universidad. El primer día llegaste antes que todos y te sentaste solo en la plaza, sin conocer a nadie, convencido de que habías elegido bien.',
    image: foto('07-universidad-solo', 'decisiones-02'),
    realImage: 'jm/decisiones-02',
    anchors: ['solo', 'nadie', 'antes'],
    imageAlt: 'Un joven sonríe sentado en una banca de la plaza de su universidad.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'presente',
    approxAge: 21,
    title: 'La primera Navidad',
    statement:
      'Esa Navidad cargaste a tu sobrino por primera vez. Le pusiste tu camiseta de Metallica y, antes de que aprendiera a caminar, ya le habías regalado su primera guitarra.',
    image: foto('08-navidad-guitarra', 'presente-03'),
    realImage: 'jm/presente-03',
    anchors: ['sobrino', 'regalado', 'guitarra'],
    imageAlt: 'Un joven sonríe mientras carga a un bebé en una sala decorada para Navidad.',
    kind: 'interes',
    origin: 'inferido',
  },

];

export function demoMemories(): Memory[] {
  const count: Partial<Record<LifeStage, number>> = {};
  const birthYear = DEMO_PROFILE.edad !== null ? new Date().getFullYear() - DEMO_PROFILE.edad : null;
  return DRAFTS.map((d) => {
    count[d.stage] = (count[d.stage] ?? 0) + 1;
    return {
      ...d,
      id: `${d.stage}-${count[d.stage]}`,
      approxYear: d.approxAge !== null && birthYear !== null ? birthYear + d.approxAge : null,
      imageAlt: `${d.imageAlt} Fotografía del ejemplo.`,
      speculative: true,
      evaluation: 'pendiente',
      correction: '',
      visualState: visualStateFor('pendiente', ''),
    };
  });
}

/** Portadas de capítulo del ejemplo (fotos de JM, o del banco cuando faltan). */
export const DEMO_ART: Record<LifeStage, { cover: string; front: string }> = {
  infancia: { cover: 'jm/infancia-08', front: 'jm/infancia-04' },
  adolescencia: { cover: 'jm/adolescencia-02', front: 'jm/infancia-19' },
  decisiones: { cover: 'jm/decisiones-03', front: 'cuaderno' },
  presente: { cover: 'azotea-ciudad', front: 'audifonos' },
};

export const DEMO_FIRST_PHOTO = 'jm/infancia-01';
