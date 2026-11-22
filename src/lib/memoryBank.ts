/* ==========================================================================
   BANCO DE RECUERDOS (en ruso: el escenario es Moscú 2050)
   Cada partida combina al azar plantillas y fotografías. Hay tres familias:
   - «barnum»: afirmaciones vagas que casi cualquiera reconoce como propias.
   - «especifico»: hechos concretos inventados, que rara vez coinciden.
   - Recuerdos anclados en un dato aportado (interés, ciudad, hito).
   Los datos que escribe la persona (ciudad, interés) no se pueden declinar
   automáticamente: las frases están redactadas para usarlos en nominativo.
   ========================================================================== */
import type { LifeStage, MemoryKind, Profile } from './types';

export interface InterestVocab {
  /** El interés tal como se nombra, en nominativo: «музыка». */
  tema: string;
  /** Lo que la persona «hacía»: «подбирать песни на слух». */
  practica: string;
  /** Un objeto concreto: «старая гитара». */
  objeto: string;
  /** Qué hacía durante noches enteras: «слушал пластинки». */
  gerundio: string;
  /** Fotografías que encajan con el interés. */
  imagenes: string[];
}

/** Texto alternativo de cada fotografía ilustrativa. */
export const IMAGE_ALT: Record<string, string> = {
  partido: 'Дети бегут за мячом по полю на закате.',
  'parque-vacio': 'Пустая детская площадка с качелями под деревьями.',
  columpios: 'Пустые качели в парке.',
  'nina-columpio': 'Девочка на качелях, вид со спины.',
  'calle-barrio': 'Тихая улица с деревьями и низкими домами.',
  calle: 'Улица на закате с фонарными столбами.',
  cumpleanos: 'Праздничный торт с горящими свечами на семейном столе.',
  'sala-album': 'Открытый фотоальбом на столе в гостиной.',
  bebe: 'Ладошки малыша и отпечаток ножки.',
  'habitacion-infantil': 'Детская комната с игрушками и рисунками на стене.',
  'nino-sonrie': 'Мальчик улыбается, глядя вверх.',
  'colegio-pasillo': 'Пустой школьный коридор со шкафчиками в вечернем свете.',
  pasillo: 'Школьный коридор, освещённый окнами.',
  'cuatro-amigos': 'Четверо подростков обнимаются, вид со спины.',
  'amigos-calle': 'Группа молодых людей идёт по улице.',
  cancha: 'Дворовая баскетбольная площадка с длинными тенями.',
  'futbol-joven': 'Подросток играет в футбол на поле.',
  'habitacion-adolescente': 'Комната подростка с плакатами и освещённым столом.',
  'sala-musica': 'Электрогитара и барабаны в репетиционной.',
  tocadiscos: 'Вращающийся проигрыватель.',
  'cuaderno-escritorio': 'Открытая тетрадь с ручкой на столе.',
  cuaderno: 'Тетрадь с записями рядом с ноутбуком.',
  escritorio: 'Юноша пишет за столом под лампой.',
  edificio: 'Фасад старого здания.',
  audifonos: 'Человек в наушниках смотрит на горизонт на закате.',
  'azotea-ciudad': 'Человек со спины смотрит на город с крыши в сумерках.',
  ciudad: 'Человек со спины смотрит на город с холма.',
  niebla: 'Пейзаж, укрытый туманом.',
  nube: 'Облако в небе.',
};

export interface Ctx {
  p: Profile;
  v: InterestVocab;
  /** Ciudad de origen en nominativo, o null si no se conoce. */
  origen: string | null;
  actual: string;
  misma: boolean;
  sinCiudades: boolean;
  nombre: string;
  /** "14 августа", si la persona dio su cumpleaños. */
  fecha: string | null;
  /** "В 8 лет" o un texto alternativo si no conocemos la edad. */
  enAnios: (age: number | null, fallback: string) => string;
  capitalizar: (s: string) => string;
  /** Edad con su plural ruso: "8 лет". */
  anios: (age: number) => string;
}

export interface Entry {
  id: string;
  stage: LifeStage;
  /** Edad típica. Cero o negativa = relativa a la edad actual (−1 → el año pasado). */
  age: number;
  kind: MemoryKind;
  title: string | ((c: Ctx) => string);
  text: (c: Ctx, age: number | null) => string;
  images: string[] | ((c: Ctx) => string[]);
  when?: (c: Ctx) => boolean;
}

/** «в городе Кали» o «в родном городе» si no lo sabemos. */
const enCiudad = (c: Ctx) => (c.origen ? `в городе ${c.origen}` : 'в родном городе');

export const BANK: Entry[] = [
  /* ----------------------------- INFANCIA ----------------------------- */
  {
    id: 'inf-tardes', stage: 'infancia', age: 6, kind: 'barnum', title: 'Вечера на улице',
    text: (c) => `В детстве ${enCiudad(c)} ты любил проводить вечера на улице с друзьями, пока не стемнеет.`,
    images: ['partido', 'parque-vacio', 'columpios'],
  },
  {
    id: 'inf-columpio', stage: 'infancia', age: 5, kind: 'especifico', title: 'Шрам',
    text: (c, a) => `${c.enAnios(a, 'Однажды в парке')} ты упал с качелей, и на колене остался маленький шрам. Ты до сих пор иногда на него смотришь.`,
    images: ['parque-vacio', 'columpios', 'nina-columpio'],
  },
  {
    id: 'inf-cumple', stage: 'infancia', age: 7, kind: 'especifico', title: 'День рождения',
    text: (c, a) =>
      c.fecha
        ? `Тебе особенно запомнилось одно ${c.fecha}: ${a !== null ? `тебе исполнялось ${c.anios(a)}` : 'это был твой день рождения'}. Был торт с тонкими свечками, два воздушных шара и кто-то, кто опоздал с подарком, завёрнутым в газету.`
        : `${a !== null ? `Твой день рождения в ${c.anios(a)}` : 'Один из первых дней рождения'} был самым особенным: торт с тонкими свечками, два воздушных шара и кто-то, кто опоздал с подарком, завёрнутым в газету.`,
    images: ['cumpleanos'],
  },
  {
    id: 'inf-album', stage: 'infancia', age: 6, kind: 'barnum', title: 'Домашний альбом',
    text: () => 'Дома был фотоальбом, который ты любил листать снова и снова. Некоторые снимки ты помнишь так хорошо, что уже не знаешь, был ли ты там или только видел фотографию.',
    images: ['sala-album', 'bebe'],
  },
  {
    id: 'inf-cuarto', stage: 'infancia', age: 5, kind: 'barnum', title: 'Целый мир',
    text: () => 'Твоя детская комната была маленькой, но для тебя она была целым миром. Ты вешал рисунки на стену, и у тебя была игрушка, с которой ты не расставался.',
    images: ['habitacion-infantil'],
  },
  {
    id: 'inf-bici', stage: 'infancia', age: 8, kind: 'especifico', title: 'Велосипед',
    text: (c, a) => `${c.enAnios(a, 'Однажды в воскресенье')} ты научился кататься на велосипеде на крутой улице ${enCiudad(c)}. Никто тебя не держал: у тебя получилось с первой попытки.`,
    images: ['calle-barrio', 'calle'],
  },
  {
    id: 'inf-primer-dia', stage: 'infancia', age: 5, kind: 'especifico', title: 'Первый день',
    text: () => 'В первый школьный день ты плакал у двери. Учительница с тихим голосом взяла тебя за руку и проводила до парты.',
    images: ['colegio-pasillo', 'pasillo'],
  },
  {
    id: 'inf-interes', stage: 'infancia', age: 8, kind: 'interes', title: 'Первая встреча',
    when: (c) => !!c.p.interes,
    text: (c, a) => `${c.enAnios(a, 'Когда ты только начинал расти,')} тебе подарили ${c.v.objeto}. Так началась твоя история с увлечением «${c.v.tema}», хотя тогда об этом никто не знал.`,
    images: ['nino-sonrie', 'habitacion-infantil', 'sala-album'],
  },

  /* --------------------------- ADOLESCENCIA --------------------------- */
  {
    id: 'ado-grupo', stage: 'adolescencia', age: 13, kind: 'barnum', title: 'Неразлучная компания',
    text: () => 'В юности у тебя была неразлучная компания друзей. Каждый день после школы вы шли домой вместе.',
    images: ['cuatro-amigos', 'amigos-calle'],
  },
  {
    id: 'ado-cancha', stage: 'adolescencia', age: 14, kind: 'especifico', title: 'Субботы на площадке',
    text: (c, a) => `Ты проводил субботы на дворовой площадке. ${c.enAnios(a, 'Однажды')} ты забил решающий мяч в игре, которую никто, кроме тебя, не помнит.`,
    images: ['cancha', 'futbol-joven'],
  },
  {
    id: 'ado-refugio', stage: 'adolescencia', age: 15, kind: 'barnum', title: 'Убежище',
    text: () => 'В те годы твоя комната стала убежищем: ты закрывал дверь, включал музыку и чувствовал, что тебя никто до конца не понимает.',
    images: ['habitacion-adolescente'],
  },
  {
    id: 'ado-banda', stage: 'adolescencia', age: 15, kind: 'especifico', title: 'Группа',
    text: (c, a) => `${c.enAnios(a, 'В школе')} ты собрал группу с двумя одноклассниками. Вы репетировали в чужом доме и так ни разу и не выступили.`,
    images: ['sala-musica', 'tocadiscos'],
  },
  {
    id: 'ado-fuera', stage: 'adolescencia', age: 14, kind: 'barnum', title: 'Не на своём месте',
    text: () => 'Бывали дни, когда ты чувствовал себя не на своём месте, хотя со стороны казалось, что у тебя всё под контролем.',
    images: ['colegio-pasillo', 'pasillo'],
  },
  {
    id: 'ado-diario', stage: 'adolescencia', age: 13, kind: 'especifico', title: 'Дневник',
    text: (c, a) => `${c.enAnios(a, 'В юности')} ты начал вести дневник. Ты прятал его под матрасом, а однажды без всякой причины перестал писать.`,
    images: ['cuaderno-escritorio', 'habitacion-adolescente'],
  },
  {
    id: 'ado-interes', stage: 'adolescencia', age: 15, kind: 'interes', title: 'Страсть, которая изменила планы',
    when: (c) => !!c.p.interes,
    text: (c, a) => `${c.enAnios(a, 'В юности')} ты понял, что «${c.v.tema}» — это не просто хобби. Ты целыми ночами ${c.v.gerundio} и начал представлять своё будущее вокруг этого.`,
    images: (c) => c.v.imagenes,
  },

  /* ---------------------------- DECISIONES ---------------------------- */
  {
    id: 'dec-claro', stage: 'decisiones', age: 17, kind: 'especifico', title: 'Знать, куда идти',
    text: () => 'Ты всегда ясно знал, чем хочешь заниматься. Ты выбрал свой путь без сомнений, хотя не все вокруг тебя поняли.',
    images: ['colegio-pasillo', 'pasillo', 'calle'],
  },
  {
    id: 'dec-duda', stage: 'decisiones', age: 17, kind: 'barnum', title: 'Сомнение',
    text: () => 'Когда пришло время выбирать путь, ты сомневался сильнее, чем признавал. Ты выбрал вариант, о котором до сих пор иногда спрашиваешь себя, был ли он верным.',
    images: ['cuaderno-escritorio', 'colegio-pasillo', 'escritorio'],
  },
  {
    id: 'dec-ciudad', stage: 'decisiones', age: 19, kind: 'ciudad', title: (c) => (c.misma ? 'Остаться' : 'Новый город'),
    when: (c) => !c.sinCiudades,
    text: (c, a) =>
      c.misma
        ? `Ты решил остаться ${enCiudad(c)}, хотя не раз представлял, каково было бы уехать далеко.`
        : `${c.enAnios(a, 'Однажды')} ты уехал из родного города, чтобы начать всё заново в городе ${c.actual}. В первую ночь ты бродил по улицам, пытаясь почувствовать его своим.`,
    images: ['calle', 'calle-barrio', 'ciudad'],
  },
  {
    id: 'dec-carta', stage: 'decisiones', age: 18, kind: 'especifico', title: 'Письмо',
    text: (c, a) => `${c.enAnios(a, 'После школы')} ты написал письмо себе в будущее и спрятал его в тетрадь. Ты до сих пор его не открыл.`,
    images: ['cuaderno-escritorio', 'cuaderno'],
  },
  {
    id: 'dec-consejo', stage: 'decisiones', age: 18, kind: 'barnum', title: 'Тот, кто в тебя поверил',
    text: () => 'Был взрослый человек, который поверил в тебя раньше, чем ты сам. Одна его фраза до сих пор с тобой, когда нужно принять важное решение.',
    images: ['sala-album', 'pasillo'],
  },
  {
    id: 'dec-trabajo', stage: 'decisiones', age: 19, kind: 'especifico', title: 'Первая зарплата',
    text: (c, a) => `${c.enAnios(a, 'Совсем молодым')} ты нашёл первую работу. На первую зарплату ты купил что-то ненужное — просто чтобы почувствовать, что это твоё.`,
    images: ['calle-barrio', 'edificio'],
  },
  {
    id: 'dec-irse', stage: 'decisiones', age: 18, kind: 'barnum', title: 'Уехать или остаться',
    when: (c) => c.sinCiudades,
    text: () => 'Был момент, когда ты всерьёз думал уехать далеко, но что-то заставило тебя остаться.',
    images: ['calle', 'calle-barrio'],
  },

  /* ----------------------------- PRESENTE ----------------------------- */
  {
    id: 'pre-hito', stage: 'presente', age: -1, kind: 'hito', title: 'Момент, который всё изменил',
    when: (c) => !!c.p.hito.trim(),
    text: (c) => `Ты вспоминаешь «${c.p.hito.trim().replace(/[.«»]+$/g, '')}» как момент, когда всё изменилось. В тот день ты почувствовал, что наконец оказался на своём месте.`,
    images: ['audifonos', 'azotea-ciudad'],
  },
  {
    id: 'pre-momento', stage: 'presente', age: -1, kind: 'barnum', title: 'Недавний момент',
    when: (c) => !c.p.hito.trim(),
    text: () => 'Недавно ты пережил момент, который всё изменил. В тот день ты почувствовал, что наконец оказался на своём месте.',
    images: ['audifonos', 'azotea-ciudad'],
  },
  {
    id: 'pre-quien', stage: 'presente', age: 0, kind: 'interes', title: 'Кем ты стал',
    when: (c) => !!c.p.interes,
    text: (c) =>
      `${c.p.edad !== null ? `Сегодня, в ${c.anios(c.p.edad)}, ` : 'Сегодня '}${c.actual ? `ты живёшь в городе ${c.actual}, и ` : ''}«${c.v.tema}» по-прежнему в центре твоих дней. ${c.nombre ? `${c.capitalizar(c.nombre)}, ты` : 'Ты'} точно знаешь, кем стал.`,
    images: ['ciudad', 'azotea-ciudad'],
  },
  {
    id: 'pre-potencial', stage: 'presente', age: 0, kind: 'barnum', title: 'То, что ты ещё не показал',
    text: () => 'Сегодня ты знаешь, что у тебя есть потенциал, который ты ещё не раскрыл до конца. Иногда ты требуешь от себя больше, чем от других.',
    images: ['azotea-ciudad', 'niebla', 'nube'],
  },
  {
    id: 'pre-nostalgia', stage: 'presente', age: 0, kind: 'barnum', title: 'Ностальгия',
    text: () => 'В последнее время ты смотришь старые фотографии чаще, чем готов признать. Ты скучаешь по времени, которое тогда не казалось особенным.',
    images: ['sala-album'],
  },
  {
    id: 'pre-rutina', stage: 'presente', age: 0, kind: 'especifico', title: 'Та же чашка',
    text: () => 'Каждое утро ты начинаешь с той же чашки, у того же окна, записывая список дел, который почти никогда не заканчиваешь.',
    images: ['cuaderno-escritorio'],
  },
];

/** Fotografías de reserva por etapa, por si las candidatas de un recuerdo ya se usaron. */
export const STAGE_IMAGES: Record<LifeStage, string[]> = {
  infancia: ['parque-vacio', 'columpios', 'habitacion-infantil', 'nino-sonrie', 'calle-barrio', 'sala-album', 'partido'],
  adolescencia: ['habitacion-adolescente', 'cuatro-amigos', 'amigos-calle', 'cancha', 'colegio-pasillo', 'sala-musica'],
  decisiones: ['colegio-pasillo', 'pasillo', 'calle', 'calle-barrio', 'cuaderno', 'escritorio', 'edificio'],
  presente: ['azotea-ciudad', 'ciudad', 'audifonos', 'niebla', 'sala-album', 'cuaderno-escritorio'],
};

/** Portadas posibles de cada capítulo. */
export const ART_POOL: Record<LifeStage, { cover: string[]; front: string[] }> = {
  infancia: { cover: ['columpios', 'parque-vacio', 'habitacion-infantil', 'calle-barrio'], front: ['nino-balon', 'nina-columpio', 'bebe', 'caminando'] },
  adolescencia: { cover: ['amigos-calle', 'cancha', 'colegio-pasillo', 'habitacion-adolescente'], front: ['sonrisa', 'futbol-joven', 'tocadiscos'] },
  decisiones: { cover: ['edificio', 'colegio-pasillo', 'calle', 'cuaderno-escritorio'], front: ['cuaderno', 'pasillo', 'escritorio'] },
  presente: { cover: ['nube', 'azotea-ciudad', 'ciudad', 'niebla'], front: ['niebla', 'audifonos', 'nube'] },
};
