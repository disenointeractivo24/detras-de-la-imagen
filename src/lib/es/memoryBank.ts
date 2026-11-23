/* ==========================================================================
   BANCO DE RECUERDOS
   Cada partida combina al azar plantillas y fotografías. Hay tres familias:
   - «barnum»: afirmaciones vagas que casi cualquiera reconoce como propias.
   - «especifico»: hechos concretos inventados, que rara vez coinciden.
   - Recuerdos anclados en un dato aportado (interés, ciudad, hito, signo).
   La mezcla hace que a veces la biografía acierte… y que no siempre.
   ========================================================================== */
import type { LifeStage, MemoryKind, Profile } from '../types';
import { ELEMENTO_ADOLESCENCIA, type Signo } from './zodiac';

export interface InterestVocab {
  /** El interés tal como suena en una frase: "la música". */
  tema: string;
  /** Lo que la persona "hacía": "tocar canciones de oído". */
  practica: string;
  /** Un objeto concreto: "una guitarra vieja". */
  objeto: string;
  /** Verbo en gerundio: "componiendo". */
  gerundio: string;
  /** Fotografías que encajan con el interés. */
  imagenes: string[];
}

/** Texto alternativo de cada fotografía ilustrativa. */
export const IMAGE_ALT: Record<string, string> = {
  partido: 'Niños corriendo detrás de un balón en un campo al atardecer.',
  'parque-vacio': 'Un parque infantil vacío con columpios bajo los árboles.',
  columpios: 'Columpios vacíos en un parque.',
  'nina-columpio': 'Una niña de espaldas en un columpio.',
  'calle-barrio': 'Una calle tranquila de barrio con árboles y casas bajas.',
  calle: 'Una calle de barrio al atardecer con postes de luz.',
  cumpleanos: 'Un pastel de cumpleaños con velas encendidas sobre una mesa familiar.',
  'sala-album': 'Un álbum de fotos abierto sobre la mesa de una sala.',
  bebe: 'Manos de un bebé y la huella de un pie.',
  'habitacion-infantil': 'Una habitación infantil con peluches y dibujos en la pared.',
  'nino-sonrie': 'Un niño mira hacia arriba sonriendo.',
  'colegio-pasillo': 'Un pasillo de colegio vacío con casilleros y luz de tarde.',
  pasillo: 'Un pasillo de colegio iluminado por las ventanas.',
  'cuatro-amigos': 'Cuatro adolescentes abrazados de espaldas.',
  'amigos-calle': 'Un grupo de jóvenes caminando por una calle.',
  cancha: 'Una cancha de baloncesto de barrio con sombras largas.',
  'futbol-joven': 'Un adolescente juega al fútbol en un campo.',
  'habitacion-adolescente': 'Una habitación adolescente con afiches y un escritorio iluminado.',
  'sala-musica': 'Una guitarra eléctrica y una batería en un cuarto de ensayo.',
  tocadiscos: 'Un tocadiscos girando.',
  'cuaderno-escritorio': 'Un cuaderno abierto con un bolígrafo sobre un escritorio.',
  cuaderno: 'Un cuaderno de apuntes junto a un portátil.',
  escritorio: 'Un joven escribe en su escritorio bajo una lámpara.',
  edificio: 'La fachada de un edificio antiguo.',
  audifonos: 'Una persona con audífonos mira el horizonte al atardecer.',
  'azotea-ciudad': 'Una persona de espaldas mira la ciudad desde una azotea al anochecer.',
  ciudad: 'Una persona de espaldas observa una ciudad desde una colina.',
  niebla: 'Un paisaje cubierto de niebla.',
  nube: 'Una nube en el cielo.',
};

export interface Ctx {
  p: Profile;
  v: InterestVocab;
  origen: string;
  actual: string;
  misma: boolean;
  sinCiudades: boolean;
  nombre: string;
  signo: Signo | null;
  /** "14 de agosto", si la persona dio su cumpleaños. */
  fecha: string | null;
  /** "A los 8 años" o un texto alternativo si no conocemos la edad. */
  enAnios: (age: number | null, fallback: string) => string;
  capitalizar: (s: string) => string;
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

export const BANK: Entry[] = [
  /* ----------------------------- INFANCIA ----------------------------- */
  {
    id: 'inf-tardes', stage: 'infancia', age: 6, kind: 'barnum', title: 'Las tardes afuera',
    text: (c) => `Durante tu infancia en ${c.origen}, disfrutabas pasar las tardes jugando al aire libre con tus amigos hasta que oscurecía.`,
    images: ['partido', 'parque-vacio', 'columpios'],
  },
  {
    id: 'inf-columpio', stage: 'infancia', age: 5, kind: 'especifico', title: 'La cicatriz',
    text: (c, a) => `${c.enAnios(a, 'Una tarde en el parque,')} te caíste de un columpio y te quedó una pequeña cicatriz en la rodilla. Todavía la miras de vez en cuando.`,
    images: ['parque-vacio', 'columpios', 'nina-columpio'],
  },
  {
    id: 'inf-cumple', stage: 'infancia', age: 7, kind: 'especifico', title: 'El cumpleaños',
    text: (c, a) =>
      c.fecha
        ? `Recuerdas especialmente un ${c.fecha}: ${a !== null ? `cumplías ${a} años` : 'era tu cumpleaños'}. Hubo un pastel con velas delgadas, dos globos y alguien que llegó tarde con un regalo envuelto en papel periódico.`
        : `${a !== null ? `Tu cumpleaños número ${a}` : 'Uno de tus primeros cumpleaños'} fue el más especial: hubo un pastel con velas delgadas, dos globos y alguien que llegó tarde con un regalo envuelto en papel periódico.`,
    images: ['cumpleanos'],
  },
  {
    id: 'inf-album', stage: 'infancia', age: 6, kind: 'barnum', title: 'El álbum de la casa',
    text: () => 'En casa había un álbum de fotos que te gustaba mirar una y otra vez. Algunas imágenes las recuerdas tan bien que ya no sabes si viviste el momento o solo lo viste fotografiado.',
    images: ['sala-album', 'bebe'],
  },
  {
    id: 'inf-cuarto', stage: 'infancia', age: 5, kind: 'barnum', title: 'Un mundo entero',
    text: () => 'Tu habitación de infancia era pequeña, pero para ti era un mundo entero. Pegabas dibujos en la pared y había un peluche del que no te separabas.',
    images: ['habitacion-infantil'],
  },
  {
    id: 'inf-bici', stage: 'infancia', age: 8, kind: 'especifico', title: 'La bicicleta',
    text: (c, a) => `${c.enAnios(a, 'Un domingo')} aprendiste a montar en bicicleta en una calle empinada de ${c.origen}. Nadie te sostuvo: lo lograste al primer intento.`,
    images: ['calle-barrio', 'calle'],
  },
  {
    id: 'inf-primer-dia', stage: 'infancia', age: 5, kind: 'especifico', title: 'El primer día',
    text: () => 'Tu primer día de colegio lloraste en la puerta. Una profesora de voz suave te tomó de la mano y te acompañó hasta tu puesto.',
    images: ['colegio-pasillo', 'pasillo'],
  },
  {
    id: 'inf-interes', stage: 'infancia', age: 8, kind: 'interes', title: 'El primer encuentro',
    when: (c) => !!c.p.interes,
    text: (c, a) => `${c.enAnios(a, 'Cuando apenas empezabas a crecer,')} llegó a tus manos ${c.v.objeto}. Así empezó tu relación con ${c.v.tema}, aunque entonces nadie lo sabía.`,
    images: ['nino-sonrie', 'habitacion-infantil', 'sala-album'],
  },
  {
    id: 'inf-signo', stage: 'infancia', age: 6, kind: 'signo', title: (c) => `Bajo el signo de ${c.signo?.nombre}`,
    when: (c) => !!c.signo,
    text: (c) => `Naciste bajo el signo de ${c.signo!.nombre}, y quienes te vieron crecer dicen que ya entonces ${c.signo!.nino}.`,
    images: ['habitacion-infantil', 'nino-sonrie', 'nina-columpio', 'bebe'],
  },

  /* --------------------------- ADOLESCENCIA --------------------------- */
  {
    id: 'ado-grupo', stage: 'adolescencia', age: 13, kind: 'barnum', title: 'El grupo inseparable',
    text: () => 'En tu adolescencia formaste parte de un grupo de amigos inseparable. Caminaban juntos cada tarde a la salida del colegio.',
    images: ['cuatro-amigos', 'amigos-calle'],
  },
  {
    id: 'ado-cancha', stage: 'adolescencia', age: 14, kind: 'especifico', title: 'Los sábados en la cancha',
    text: (c, a) => `Pasabas los sábados en la cancha del barrio. ${c.enAnios(a, 'Una tarde')} anotaste el punto que ganó un partido que nadie más recuerda, pero tú sí.`,
    images: ['cancha', 'futbol-joven'],
  },
  {
    id: 'ado-refugio', stage: 'adolescencia', age: 15, kind: 'barnum', title: 'El refugio',
    text: () => 'En esos años tu habitación se volvió tu refugio: cerrabas la puerta, ponías música y sentías que nadie te entendía del todo.',
    images: ['habitacion-adolescente'],
  },
  {
    id: 'ado-banda', stage: 'adolescencia', age: 15, kind: 'especifico', title: 'La banda',
    text: (c, a) => `${c.enAnios(a, 'En el colegio')} formaste una banda con dos compañeros. Ensayaban en una casa prestada y nunca llegaron a tocar en público.`,
    images: ['sala-musica', 'tocadiscos'],
  },
  {
    id: 'ado-fuera', stage: 'adolescencia', age: 14, kind: 'barnum', title: 'Fuera de lugar',
    text: () => 'Había días en que te sentías fuera de lugar, aunque por fuera parecía que tenías todo bajo control.',
    images: ['colegio-pasillo', 'pasillo'],
  },
  {
    id: 'ado-diario', stage: 'adolescencia', age: 13, kind: 'especifico', title: 'El diario',
    text: (c, a) => `${c.enAnios(a, 'En tu adolescencia')} empezaste a escribir un diario. Lo escondías debajo del colchón y un día, sin explicación, dejaste de escribir.`,
    images: ['cuaderno-escritorio', 'habitacion-adolescente'],
  },
  {
    id: 'ado-interes', stage: 'adolescencia', age: 15, kind: 'interes', title: 'Una pasión que cambió los planes',
    when: (c) => !!c.p.interes,
    text: (c, a) => `${c.enAnios(a, 'En tu adolescencia')} descubriste que ${c.v.tema} no era solo un pasatiempo. Pasabas noches enteras ${c.v.gerundio} y empezaste a imaginar tu futuro alrededor de ello.`,
    images: (c) => c.v.imagenes,
  },
  {
    id: 'ado-signo', stage: 'adolescencia', age: 14, kind: 'signo', title: (c) => `Signo de ${c.signo?.elemento}`,
    when: (c) => !!c.signo,
    text: (c) => `Signo de ${c.signo!.elemento}, al fin y al cabo: en tu adolescencia ${ELEMENTO_ADOLESCENCIA[c.signo!.elemento]}.`,
    images: ['habitacion-adolescente', 'cuatro-amigos', 'amigos-calle'],
  },

  /* ---------------------------- DECISIONES ---------------------------- */
  {
    id: 'dec-claro', stage: 'decisiones', age: 17, kind: 'especifico', title: 'Saber hacia dónde ir',
    text: () => 'Siempre tuviste claro qué querías hacer con tu futuro. Elegiste tu camino sin dudar, aunque no todos a tu alrededor lo entendieron.',
    images: ['colegio-pasillo', 'pasillo', 'calle'],
  },
  {
    id: 'dec-duda', stage: 'decisiones', age: 17, kind: 'barnum', title: 'La duda',
    text: () => 'Cuando llegó el momento de elegir tu camino, dudaste más de lo que admitiste. Escogiste una opción que, todavía hoy, a veces te preguntas si fue la correcta.',
    images: ['cuaderno-escritorio', 'colegio-pasillo', 'escritorio'],
  },
  {
    id: 'dec-ciudad', stage: 'decisiones', age: 19, kind: 'ciudad', title: (c) => (c.misma ? 'Quedarse' : 'Una ciudad nueva'),
    when: (c) => !c.sinCiudades,
    text: (c, a) =>
      c.misma
        ? `Decidiste quedarte en ${c.origen}, aunque más de una vez imaginaste cómo habría sido marcharte lejos.`
        : `${c.enAnios(a, 'Un día')} dejaste ${c.origen} para empezar de nuevo en ${c.actual}. La primera noche recorriste sus calles intentando reconocerla como tuya.`,
    images: ['calle', 'calle-barrio', 'ciudad'],
  },
  {
    id: 'dec-carta', stage: 'decisiones', age: 18, kind: 'especifico', title: 'La carta',
    text: (c, a) => `${c.enAnios(a, 'Al terminar el colegio')} escribiste una carta a tu yo del futuro y la guardaste dentro de un cuaderno. Todavía no la has vuelto a abrir.`,
    images: ['cuaderno-escritorio', 'cuaderno'],
  },
  {
    id: 'dec-consejo', stage: 'decisiones', age: 18, kind: 'barnum', title: 'Alguien que creyó en ti',
    text: () => 'Hubo una persona mayor que creyó en ti antes de que tú lo hicieras. Una frase suya todavía te acompaña cada vez que tienes que decidir algo importante.',
    images: ['sala-album', 'pasillo'],
  },
  {
    id: 'dec-trabajo', stage: 'decisiones', age: 19, kind: 'especifico', title: 'El primer sueldo',
    text: (c, a) => `${c.enAnios(a, 'Muy joven')} conseguiste tu primer trabajo. Con el primer pago compraste algo que no necesitabas, solo para sentir que era tuyo.`,
    images: ['calle-barrio', 'edificio'],
  },
  {
    id: 'dec-irse', stage: 'decisiones', age: 18, kind: 'barnum', title: 'Irse o quedarse',
    when: (c) => c.sinCiudades,
    text: () => 'Llegó un momento en que pensaste seriamente en irte lejos, pero algo te hizo quedarte donde estabas.',
    images: ['calle', 'calle-barrio'],
  },

  /* ----------------------------- PRESENTE ----------------------------- */
  {
    id: 'pre-hito', stage: 'presente', age: -1, kind: 'hito', title: 'El momento que lo cambió todo',
    when: (c) => !!c.p.hito.trim(),
    text: (c) => `Recuerdas «${c.p.hito.trim().replace(/[.«»]+$/g, '')}» como el momento en que todo cambió. Ese día sentiste que, por fin, estabas en el lugar correcto.`,
    images: ['audifonos', 'azotea-ciudad'],
  },
  {
    id: 'pre-momento', stage: 'presente', age: -1, kind: 'barnum', title: 'Un momento reciente',
    when: (c) => !c.p.hito.trim(),
    text: () => 'Hace poco viviste un momento que lo cambió todo. Ese día sentiste que, por fin, estabas en el lugar correcto.',
    images: ['audifonos', 'azotea-ciudad'],
  },
  {
    id: 'pre-quien', stage: 'presente', age: 0, kind: 'interes', title: 'En quién te has convertido',
    when: (c) => !!c.p.interes,
    text: (c) =>
      `${c.p.edad !== null ? `Hoy, con ${c.p.edad} años, ` : 'Hoy '}${c.actual ? `vives en ${c.actual} y ` : ''}${c.v.tema} sigue siendo el centro de tus días. ${c.nombre ? `${c.capitalizar(c.nombre)}, sabes` : 'Sabes'} exactamente en quién te has convertido.`,
    images: ['ciudad', 'azotea-ciudad'],
  },
  {
    id: 'pre-potencial', stage: 'presente', age: 0, kind: 'barnum', title: 'Lo que aún no muestras',
    text: () => 'Hoy sabes que tienes un potencial que todavía no has aprovechado del todo. A veces te exiges más de lo que les exiges a los demás.',
    images: ['azotea-ciudad', 'niebla', 'nube'],
  },
  {
    id: 'pre-nostalgia', stage: 'presente', age: 0, kind: 'barnum', title: 'Nostalgia',
    text: () => 'Últimamente miras fotos antiguas más de lo que te gustaría admitir. Sientes nostalgia por una época que, en su momento, no te pareció especial.',
    images: ['sala-album'],
  },
  {
    id: 'pre-rutina', stage: 'presente', age: 0, kind: 'especifico', title: 'La misma taza',
    text: () => 'Cada mañana empiezas el día con la misma taza, frente a la misma ventana, escribiendo una lista de pendientes que casi nunca terminas.',
    images: ['cuaderno-escritorio'],
  },
  {
    id: 'pre-signo', stage: 'presente', age: 0, kind: 'signo', title: (c) => `Eres ${c.signo?.nombre}`,
    when: (c) => !!c.signo,
    text: (c) => `Eres ${c.signo!.nombre}, y se nota: ${c.signo!.adulto}.`,
    images: ['azotea-ciudad', 'ciudad', 'audifonos'],
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
