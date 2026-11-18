// Convierte las fotografías del banco de stock (carpeta hermana) a WebP en dos tamaños.
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'detras-de-la-imagen-11-fotografias', 'imagenes-individuales');

const MAP = {
  '01-parque.png': 'parque-vacio',
  '02-colegio.png': 'colegio-pasillo',
  '03-sala-album.png': 'sala-album',
  '04-cumpleanos.png': 'cumpleanos',
  '05-habitacion-infantil.png': 'habitacion-infantil',
  '06-habitacion-adolescente.png': 'habitacion-adolescente',
  '07-cancha.png': 'cancha',
  '08-calle.png': 'calle-barrio',
  '09-musica.png': 'sala-musica',
  '10-cuaderno.png': 'cuaderno-escritorio',
  '11-presente.png': 'azotea-ciudad',
};

for (const [file, name] of Object.entries(MAP)) {
  const base = sharp(join(src, file)).grayscale().tint({ r: 236, g: 226, b: 210 });
  await base.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(root, 'public/img', `${name}.webp`));
  await base.clone().resize({ width: 800 }).webp({ quality: 78 }).toFile(join(root, 'public/img', `${name}-sm.webp`));
  console.log('✓', name);
}
