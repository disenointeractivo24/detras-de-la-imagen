// Procesa las fotos personales de JM (../mis-fotos) con el mismo tratamiento analógico del sitio.
// - Nombre de salida limpio: <etapa>-<número>  (p. ej. infancia-12.webp)
// - La edad se lee del final del nombre del archivo: "08-columpio-parque_5.jpeg" → 5 años.
// - Genera src/lib/jmPhotos.json con las fotos disponibles y su edad.
import sharp from 'sharp';
import { readdirSync, existsSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'mis-fotos');
const out = join(root, 'public', 'img', 'jm');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

/** Lee la edad del texto que sigue a la descripción. Devuelve null si no hay. */
function edadDe(nombre) {
  // Quita el número de orden inicial y la descripción (palabras-con-guiones).
  const resto = nombre.replace(/^\d+-/, '').replace(/^[a-záéíóúñ]+(?:-[a-záéíóúñ]+)*/i, '');
  if (/no ten[ií]a ni el a[ñn]o/i.test(resto)) return 0;
  // "-2" solo, sin nada más, es un número de variante ("columpio-parque-2"), no una edad.
  if (/^-\d+$/.test(resto.trim())) return null;
  const m = resto.match(/(\d{1,4})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n > 1900) return { year: n };
  return n;
}

const manifest = {};
for (const stage of ['infancia', 'adolescencia', 'decisiones', 'presente', 'inventadas']) {
  const dir = join(src, stage);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    if (!/\.(jpe?g|png|webp|heic)$/i.test(file)) continue;
    const base = parse(file).name;
    const num = base.match(/^(\d+)/)?.[1];
    const id = stage === 'inventadas' ? `inventadas-${base.replace(/[^a-z0-9-]/gi, '').toLowerCase()}` : `${stage}-${num ?? base}`;
    const img = sharp(join(dir, file)).rotate().grayscale().tint({ r: 236, g: 226, b: 210 }).linear(0.92, 8);
    await img.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(out, `${id}.webp`));
    await img.clone().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(join(out, `${id}-sm.webp`));
    const edad = stage === 'inventadas' ? null : edadDe(base);
    manifest[id] = { archivo: `${stage}/${file}`, edad: typeof edad === 'number' ? edad : null, anio: edad?.year ?? null };
    console.log('✓', id.padEnd(22), file, '→', edad === null ? 'sin edad' : JSON.stringify(edad));
  }
}

writeFileSync(join(root, 'src', 'lib', 'jmPhotos.json'), JSON.stringify(manifest, null, 2) + '\n');
