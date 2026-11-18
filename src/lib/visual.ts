import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

/** Fotografías del banco en alta resolución (tienen versión -sm de 800 px). */
const HIRES = new Set([
  'parque-vacio', 'colegio-pasillo', 'sala-album', 'cumpleanos', 'habitacion-infantil',
  'habitacion-adolescente', 'cancha', 'calle-barrio', 'sala-musica', 'cuaderno-escritorio', 'azotea-ciudad',
]);

/**
 * Punto de enfoque (dónde está la persona) de las fotos que se recortan a pantalla
 * completa, para que el recorte nunca deje fuera la cara.
 */
const FOCUS: Record<string, string> = {
  'jm/infancia-01': '62% 52%',
  'jm/infancia-08': '52% 38%',
  'jm/adolescencia-02': '50% 28%',
  'jm/decisiones-03': '50% 45%',
  'jm/infancia-12': '30% 50%',
};
export const focus = (name: string) => ({ objectPosition: FOCUS[name] ?? '50% 35%' });

/** Atributos de <img> con srcset cuando existe versión ligera. */
export function imgAttrs(name: string, sizes = '100vw') {
  const style = focus(name);
  if (!HIRES.has(name) && !name.startsWith('jm/')) return { src: img(name), style };
  return { src: img(name), srcSet: `${import.meta.env.BASE_URL}img/${name}-sm.webp 800w, ${import.meta.env.BASE_URL}img/${name}.webp 1600w`, sizes, style };
}

/** Generador pseudoaleatorio determinista. */
function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Devuelve un clip-path con bordes rasgados, como una fotografía arrancada
 * de un álbum. `edges` indica qué lados se rasgan.
 */
export function tornClip(seed: number, depth = 2.2, edges: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom']) {
  const r = rng(seed * 9301 + 49297);
  const pts: string[] = [];
  const steps = 22;
  const j = () => (r() * depth).toFixed(2);
  // borde superior
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${edges.includes('top') ? j() : 0}%`);
  }
  for (let i = 1; i <= steps; i++) {
    const y = (i / steps) * 100;
    pts.push(`${edges.includes('right') ? (100 - +j()).toFixed(2) : 100}% ${y.toFixed(2)}%`);
  }
  for (let i = steps - 1; i >= 0; i--) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${edges.includes('bottom') ? (100 - +j()).toFixed(2) : 100}%`);
  }
  for (let i = steps - 1; i >= 1; i--) {
    const y = (i / steps) * 100;
    pts.push(`${edges.includes('left') ? j() : 0}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(',')})`;
}

export function formatAge(age: number | null) {
  if (age === null) return 'Edad desconocida';
  return age === 1 ? '1 año' : `${age} años`;
}

export function scrollToId(id: string, reduced = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

// Solo en desarrollo: permite inspeccionar las animaciones desde la consola.
if (import.meta.env.DEV) (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
