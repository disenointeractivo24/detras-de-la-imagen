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
  interes: 'музыка',
  hito: 'Мой выпускной',
};

type DemoDraft = Pick<Memory, 'stage' | 'approxAge' | 'title' | 'statement' | 'image' | 'imageAlt' | 'kind' | 'origin' | 'realImage' | 'anchors' | 'layers' | 'layerImages'>;

const DRAFTS: DemoDraft[] = [
  {
    stage: 'infancia',
    approxAge: edadDe('infancia-12', 2),
    title: 'Первая гитара',
    statement:
      'На твой второй день рождения был торт в музыкальных нотах и плакат «Добро пожаловать на мой праздник». В тот день тебе подарили игрушечную гитару, и с тех пор ты не выпускал её из рук.',
    image: foto('10-pastel-musical-guitarra', 'infancia-12'),
    realImage: 'jm/infancia-12',
    layers: [
      { id: 'pastel', anchors: ['нот', 'музыкал'], region: [22, 61, 76, 39] },
      { id: 'guitarra', anchors: ['гитар', 'подарил'], region: [18, 30, 60, 30] },
    ],
    layerImages: {
      'guitarra+pastel': 'jm/inventadas-10-pastel-musical-guitarra',
      guitarra: 'jm/inventadas-02-guitarra-cumpleanos',
      // Si aún no existe la imagen del pastel musical sin guitarra, ese caso muestra la foto real.
      ...(manifest['inventadas-11-pastel-musical-sin-guitarra'] ? { pastel: 'jm/inventadas-11-pastel-musical-sin-guitarra' } : {}),
    },
    imageAlt: 'Маленький мальчик смеётся рядом с праздничным тортом.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    // Mismo disfraz amarillo que la foto infancia-20.
    approxAge: 8,
    title: 'Конкурс костюмов',
    statement:
      'Каждый октябрь ты ждал день костюмов. В 8 лет ты выиграл конкурс в торговом центре и вышел на сцену за призом перед всей публикой.',
    image: foto('01-concurso', 'infancia-21'),
    realImage: 'jm/infancia-21',
    anchors: ['выиграл', 'конкурс', 'приз', 'сцен'],
    imageAlt: 'Мальчик в костюме у микрофона в торговом центре.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    approxAge: 9,
    title: 'Велосипед',
    statement:
      'Велосипед был твоим способом сбежать. Ты объезжал весь район с друзьями и возвращался домой, только когда совсем темнело.',
    image: foto('04-bicicleta-amigos', 'adolescencia-01'),
    realImage: 'jm/adolescencia-01',
    anchors: ['друз', 'район', 'темнел'],
    imageAlt: 'Мальчик на BMX-велосипеде на улице.',
    kind: 'barnum',
    origin: 'especulativo',
  },
  {
    stage: 'infancia',
    approxAge: edadDe('infancia-10', 10),
    title: 'Выше облаков',
    statement:
      'Каникулы проходили в горах. Ты часами качался на качелях, уверенный, что если раскачаться посильнее, можно коснуться неба.',
    image: foto('05-columpio-cielo', 'infancia-10'),
    realImage: 'jm/infancia-10',
    anchors: ['неб', 'коснут', 'раскач'],
    imageAlt: 'Мальчик на качелях среди горного пейзажа.',
    kind: 'barnum',
    origin: 'especulativo',
  },
  {
    stage: 'adolescencia',
    approxAge: 11,
    title: 'Первая сцена',
    statement:
      'В 11 лет ты впервые сыграл перед всей школой. Руки дрожали, но с первым аккордом ты понял, что хочешь посвятить себя музыке.',
    image: foto('03-escenario-colegio', 'adolescencia-03'),
    realImage: 'jm/adolescencia-03',
    anchors: ['сыграл', 'школ', 'аккорд'],
    imageAlt: 'Подросток в школьной форме.',
    kind: 'interes',
    origin: 'inferido',
  },
  {
    stage: 'decisiones',
    approxAge: edadDe('decisiones-01', 17), // estimada
    title: 'Без сомнений',
    statement:
      'В день выпускного ты уже точно знал, на кого будешь учиться. Ты ни разу не усомнился в своём решении, хотя не все вокруг его поняли.',
    image: foto('06-grado-toga', 'decisiones-01'),
    realImage: 'jm/decisiones-01',
    anchors: ['знал', 'учить', 'усомнил'],
    imageAlt: 'Юноша в мантии выпускника с дипломом рядом с семьёй.',
    kind: 'hito',
    origin: 'inferido',
  },
  {
    stage: 'decisiones',
    approxAge: edadDe('decisiones-02', 18),
    title: 'Первый день',
    statement:
      'В 18 лет ты поступил в университет. В первый день ты пришёл раньше всех и сел один на площади, никого не зная, уверенный, что сделал правильный выбор.',
    image: foto('07-universidad-solo', 'decisiones-02'),
    realImage: 'jm/decisiones-02',
    anchors: ['один', 'никого', 'раньше'],
    imageAlt: 'Юноша улыбается, сидя на скамейке на площади своего университета.',
    kind: 'especifico',
    origin: 'especulativo',
  },
  {
    stage: 'presente',
    approxAge: 21,
    title: 'Первое Рождество',
    statement:
      'В то Рождество ты впервые взял на руки племянника. Надел на него свою футболку Metallica и ещё до того, как он научился ходить, подарил ему первую гитару.',
    image: foto('08-navidad-guitarra', 'presente-03'),
    realImage: 'jm/presente-03',
    anchors: ['племянник', 'подарил', 'гитар'],
    imageAlt: 'Юноша улыбается, держа на руках малыша в гостиной, украшенной к Рождеству.',
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
      imageAlt: `${d.imageAlt} Фотография из примера.`,
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
