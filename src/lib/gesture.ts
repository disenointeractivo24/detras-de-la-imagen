/**
 * Reconoce lo que la persona dibujó sobre la foto:
 * - «x»: dos trazos largos que se cruzan, o un tachón en zigzag → no pasó.
 * - «check»: un trazo que baja y luego sube más alto hacia la derecha → sí pasó.
 */
export type Pt = { x: number; y: number };
export type Mark = 'x' | 'check' | null;

const len = (s: Pt[]) => s.reduce((acc, p, i) => (i ? acc + Math.hypot(p.x - s[i - 1].x, p.y - s[i - 1].y) : 0), 0);

function bboxDiag(s: Pt[]) {
  const xs = s.map((p) => p.x);
  const ys = s.map((p) => p.y);
  return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function segCross(a: Pt, b: Pt, c: Pt, d: Pt) {
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}

function strokesCross(s1: Pt[], s2: Pt[]) {
  const step1 = Math.max(1, Math.floor(s1.length / 40));
  const step2 = Math.max(1, Math.floor(s2.length / 40));
  for (let i = step1; i < s1.length; i += step1)
    for (let j = step2; j < s2.length; j += step2) if (segCross(s1[i - step1], s1[i], s2[j - step2], s2[j])) return true;
  return false;
}

/** Cambios de sentido horizontal (para reconocer un tachón en zigzag). */
function reversals(s: Pt[]) {
  let dir = 0;
  let count = 0;
  let anchor = s[0].x;
  for (const p of s) {
    const dx = p.x - anchor;
    if (Math.abs(dx) < 25) continue;
    const d = Math.sign(dx);
    if (dir && d !== dir) count++;
    dir = d;
    anchor = p.x;
  }
  return count;
}

function isCheck(s: Pt[], size: number) {
  if (s.length < 5 || bboxDiag(s) < size * 0.12) return false;
  let low = 0;
  s.forEach((p, i) => (p.y > s[low].y ? (low = i) : null));
  const a = s[0];
  const b = s[low];
  const c = s[s.length - 1];
  if (low < s.length * 0.1 || low > s.length * 0.75) return false;
  const drop = b.y - a.y;
  const rise = b.y - c.y;
  return drop > 0 && rise > drop * 1.2 && c.x > b.x && b.x >= a.x - 20;
}

export function detectMark(strokes: Pt[][], size: number): Mark {
  const big = strokes.filter((s) => s.length > 3 && bboxDiag(s) > size * 0.15);
  for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++) if (strokesCross(big[i], big[j])) return 'x';
  const last = strokes[strokes.length - 1];
  if (!last) return null;
  if (len(last) > size * 0.6 && reversals(last) >= 3) return 'x';
  if (isCheck(last, size)) return 'check';
  return null;
}
