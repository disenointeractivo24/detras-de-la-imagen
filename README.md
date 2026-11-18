# Detrás de la imagen

*Una vida que la IA cree conocer.*

Experiencia web interactiva y narrativa (React + TypeScript + Vite + GSAP) en la que un sistema
ficticio de 2050 reconstruye la biografía de quien la visita a partir de unos pocos datos, y la
persona decide qué recuerdos le pertenecen realmente. Inspirada en el escenario
*3D Reconstruction of the Human History* de Earth 2050.

## Cómo ejecutarla

Requisitos: Node.js 18 o superior.

```bash
cd detras-de-la-imagen
npm install
npm run dev
```

Abre `http://localhost:5173`.

Versión de producción:

```bash
npm run build
npm run preview
```

La carpeta `dist/` resultante es un sitio estático que puede publicarse en cualquier hosting
(Netlify, Vercel, GitHub Pages…).

## Las ocho escenas

| # | Escena | Componente |
|---|--------|-----------|
| 01 | La invitación: título, fragmentos que se revelan con el cursor y convergen con el scroll | `IntroExperience` |
| 02 | ¿Quién eres?: preguntas una a una, con edición, omisión, retroceso y resumen | `IdentityQuestionnaire` |
| 03 | Una vida. Miles de recuerdos: simulación de la reconstrucción sobre una línea de tiempo | `ReconstructionSequence` |
| 04 | Así creemos que fue tu historia: biografía cronológica por capítulos | `BiographyTimeline`, `LifeChapter`, `MemoryScene` |
| 05 | ¿Esto realmente pasó?: confirmar, rechazar, dudar y corregir cada recuerdo | `MemoryDecision`, `MemoryCorrection` |
| 06 | La biografía cambia: conteos reales y una tira horizontal fragmentada | `BiographyTransformation` |
| 07 | Dos versiones de la misma vida: álbum generado vs. reconocido con deslizador | `BiographyComparison` |
| 08 | ¿Quién conoce realmente tu historia?: resultados y reflexión final | `ReflectionScene` |

Además: `NavigationControls` (menú, “Siguiente”, reducir movimiento, borrar datos),
`ScrollProgress` (línea de vida fija con el estado de cada recuerdo) y `ExperienceLayout`.

## Motor narrativo (sin IA externa)

`src/lib/memoryBank.ts` es un banco de ~30 plantillas de recuerdos, cada una con varias fotografías
candidatas. `src/lib/narrative.ts` arma en cada partida una biografía distinta de 8 recuerdos (2 por
etapa) combinándolas al azar:

- **Frases «Barnum»**: afirmaciones vagas que casi cualquiera reconoce como propias («había días en
  que te sentías fuera de lugar…»). Suelen coincidir.
- **Hechos específicos**: eventos concretos inventados (la cicatriz del columpio, la banda que nunca
  tocó en público…). Rara vez coinciden.
- **Recuerdos anclados en lo que la persona contó**: interés, ciudades, momento importante y
  **signo zodiacal** (calculado a partir del día y mes de cumpleaños, pregunta opcional). Mezclan un
  dato real con una interpretación inventada, como un horóscopo.

La semilla de cada partida se guarda, así que la biografía no cambia al recargar; «Volver a vivir la
experiencia» genera una combinación nueva. Las fotos no se repiten dentro de una misma biografía y las
portadas de los capítulos también se eligen al azar.

- Cada recuerdo guarda: id, etapa, tipo de plantilla, edad y año aproximados, enunciado, imagen,
  origen de la información, estado especulativo, evaluación, corrección y estado visual.
- Nunca inventa datos sensibles (familia concreta, salud, pérdidas, traumas).
- El sistema **nunca** clasifica un recuerdo como verdadero o falso: lo decide la persona.

Para añadir recuerdos basta con sumar entradas a `BANK`; para añadir fotos, colocarlas en
`public/img/` y nombrarlas en las listas `images` del banco.

## Privacidad y persistencia

- No hay llamadas a servicios externos (aparte de las fuentes de Google Fonts).
- El progreso se guarda solo en `localStorage` (clave `detras-de-la-imagen:v1`): datos,
  recuerdos, decisiones, correcciones, etapa actual y estado de la comparación.
- “Borrar mis datos guardados” (menú) y “Volver a vivir la experiencia” (final) eliminan todo
  tras una confirmación.

## Accesibilidad

- Todo se puede recorrer sin hacer scroll: botón “Siguiente”, menú de capítulos, nodos de la
  línea de vida y botones “Seguir avanzando en el tiempo”.
- Navegación por teclado, foco visible, etiquetas en formularios, mensajes de error claros y
  deslizador de comparación accesible (`role="slider"`, flechas, Inicio/Fin).
- Opción “Reducir movimiento” (también respeta `prefers-reduced-motion`): desactiva las
  animaciones con scroll y muestra una versión estática.

## Imágenes

Las fotografías de `public/img/` vienen de dos fuentes: las 11 fotografías de
`../detras-de-la-imagen-11-fotografias/` (exportadas a 1600 px y 800 px, servidas con `srcset`) y
recortes de las imágenes de referencia de la carpeta superior. Todas se convierten a WebP en escala de
grises con un tono cálido. Para regenerarlas:

```bash
npm run assets
```

Son ilustrativas: la experiencia lo indica en varios momentos. Como los recortes salen de
mockups, su resolución es moderada (300–860 px); para una versión final conviene sustituirlos
por fotografías de mayor resolución manteniendo los mismos nombres de archivo.

## Modo ejemplo (JM)

En la portada, «Ver el ejemplo de JM» carga una biografía preparada con fotos reales
(`../mis-fotos/`) y textos que mezclan recuerdos probables con recuerdos inventados.

- Textos y datos: `src/lib/demo.ts` (lo marcado con `EDITAR` son suposiciones a partir de las fotos).
- Fotos: se procesan con `npm run fotos` (blanco y negro, 1600 y 800 px) hacia `public/img/jm/`.
  La edad de cada foto se lee del final de su nombre (`08-columpio-parque_5.jpeg` → 5 años).
- Fotos alteradas con IA: guárdalas en `../mis-fotos/inventadas/` con los nombres de
  `../mis-fotos/PROMPTS-IA.md` y ejecuta `npm run fotos`; el ejemplo las usa en cuanto existen.
- Las fotos personales se publican junto con el sitio: cualquiera que lo visite podrá verlas.
