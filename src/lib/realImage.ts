import type { Memory } from './types';

const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** Palabras tachadas, normalizadas. */
function struckWords(m: Memory) {
  const words = m.statement.split(' ');
  return (m.struck ?? []).map((i) => norm(words[i] ?? ''));
}

const hit = (struck: string[], anchors: string[]) => anchors.map(norm).some((a) => struck.some((w) => w.startsWith(a)));

/**
 * Partes inventadas que siguen en pie. Si el recuerdo tiene capas, cada capa se borra
 * por separado al tachar sus palabras; si no, una sola capa con `anchors`.
 */
function remainingLayers(m: Memory): string[] {
  if (m.evaluation === 'rechazado') return [];
  const struck = struckWords(m);
  const erased = m.erased ?? [];
  if (m.layers) return m.layers.filter((l) => !hit(struck, l.anchors) && !erased.includes(l.id)).map((l) => l.id).sort();
  return hit(struck, m.anchors ?? []) ? [] : ['todo'];
}

/** true si la persona ya borró todo lo inventado de la imagen. */
export function isUndone(m: Memory) {
  return !!m.realImage && remainingLayers(m).length === 0;
}

/** La imagen que se muestra ahora mismo, según lo que la persona haya tachado. */
export function shownImage(m: Memory) {
  if (!m.realImage) return m.image;
  const left = remainingLayers(m);
  if (left.length === 0) return m.realImage;
  if (!m.layers) return m.image;
  return m.layerImages?.[left.join('+')] ?? m.realImage;
}
