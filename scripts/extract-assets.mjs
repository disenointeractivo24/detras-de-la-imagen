// Recorta las fotografías ilustrativas de las referencias de diseño
// (carpeta superior) y las exporta como WebP optimizados a public/img.
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refs = join(root, '..');
const files = readdirSync(refs).filter((f) => f.endsWith('.png'));
const find = (n) => join(refs, files.find((f) => f.endsWith(`-${n}.png`)));

const crops = [
  // [archivo destino, referencia, left, top, width, height]
  ['nino-balon', 1, 252, 0, 290, 392],
  ['columpios', 1, 1212, 0, 460, 388],
  ['caminando', 1, 42, 205, 236, 290],
  ['pasillo', 1, 112, 602, 418, 339],
  ['calle', 1, 1272, 565, 400, 376],
  ['nina-columpio', 2, 0, 255, 318, 520],
  ['nube', 2, 1228, 62, 396, 245],
  ['edificio', 2, 1472, 470, 200, 330],
  ['hojas', 2, 0, 0, 400, 270],
  ['bebe', 3, 62, 452, 246, 226],
  ['parque', 3, 318, 422, 256, 258],
  ['nino-sonrie', 3, 588, 432, 214, 238],
  ['amigos-calle', 3, 808, 398, 262, 290],
  ['cuaderno', 3, 1118, 425, 222, 270],
  ['audifonos', 3, 1365, 335, 290, 330],
  ['partido', 4, 0, 335, 860, 606],
  ['campo', 4, 1445, 0, 227, 170],
  ['futbol-joven', 5, 95, 150, 400, 520],
  ['sonrisa', 6, 462, 92, 380, 232],
  ['cuatro-amigos', 6, 228, 322, 585, 200],
  ['escritorio', 6, 278, 534, 560, 176],
  ['ciudad', 6, 218, 735, 625, 175],
  ['tocadiscos', 6, 1198, 362, 225, 160],
  ['niebla', 6, 908, 545, 470, 165],
];

for (const [name, ref, left, top, width, height] of crops) {
  await sharp(find(ref))
    .extract({ left, top, width, height })
    .grayscale()
    .tint({ r: 236, g: 226, b: 210 })
    .webp({ quality: 84 })
    .toFile(join(root, 'public/img', `${name}.webp`));
  console.log('✓', name);
}
