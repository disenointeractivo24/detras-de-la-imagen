import { useEffect, useRef, useState } from 'react';
import { Check, Eraser, PenLine, Undo2 } from 'lucide-react';
import { detectMark, type Mark, type Pt } from '../lib/gesture';
import { t } from '../lib/i18n';

interface Props {
  initial?: string;
  active: boolean;
  onSave: (data: string) => void;
  onClose: () => void;
  /** Se llama cuando el trazo se reconoce como una X (no pasó) o un ✓ (sí pasó). */
  onMark: (mark: Exclude<Mark, null>) => void;
  /** Se deshizo el trazo que había marcado el recuerdo. */
  onUnmark: () => void;
  /** Cada trazo terminado: su centro y su tamaño, en % de la foto. */
  onStroke?: (cx: number, cy: number, size: number) => void;
}

/** Lienzo con el que se interactuó por última vez (destino del Ctrl+Z). */
let lastUsed: HTMLCanvasElement | null = null;

const W = 800;
const H = 600;
const COLORS = [
  { id: 'rojo', get label() { return t('Красный мел', 'Tiza roja'); }, c: '224,41,27' },
  { id: 'blanco', get label() { return t('Белый мел', 'Tiza blanca'); }, c: '242,240,235' },
];

/** Lienzo para rayar la foto con trazos de tiza. */
export function DrawLayer({ initial, active, onSave, onClose, onMark, onUnmark, onStroke }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef<Pt[][]>([]);
  // Historial para deshacer: una copia del lienzo antes de cada trazo.
  const history = useRef<{ img: ImageData; strokes: Pt[][]; marked: boolean }[]>([]);
  const marked = useRef(false);
  // Con ratón o lápiz se puede dibujar siempre; en pantallas táctiles, solo en modo dibujo (para no bloquear el scroll).
  const can = (e: React.PointerEvent) => active || e.pointerType !== 'touch';
  const [color, setColor] = useState(COLORS[0].c);
  const save = () => onSave(canvas.current!.toDataURL('image/webp', 0.7));

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    canvas.current!.getContext('2d')!.putImageData(prev.img, 0, 0);
    strokes.current = prev.strokes;
    if (marked.current && !prev.marked) onUnmark();
    marked.current = prev.marked;
    save();
  };

  // Ctrl+Z / Cmd+Z deshace el último trazo del lienzo usado más recientemente.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (t instanceof Element && t.closest('input, textarea, [contenteditable]')) return; // ahí manda el deshacer nativo
      if (lastUsed !== canvas.current) return;
      e.preventDefault();
      undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Solo al montar: el lienzo ya contiene lo que se va dibujando.
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (initial) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, W, H);
      img.src = initial;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  // Trazo de tiza: muchas motas pequeñas y desiguales a lo largo del segmento.
  const chalk = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = canvas.current!.getContext('2d')!;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(d / 1.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      for (let k = 0; k < 7; k++) {
        const ox = (Math.random() - 0.5) * 16;
        const oy = (Math.random() - 0.5) * 16;
        ctx.fillStyle = `rgba(${color},${0.25 + Math.random() * 0.6})`;
        ctx.fillRect(x + ox, y + oy, 1 + Math.random() * 2.6, 1 + Math.random() * 2.6);
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className={`draw ${active ? 'draw--on' : ''}`}
        aria-hidden
        onPointerDown={(e) => {
          if (!can(e)) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          lastUsed = canvas.current;
          history.current.push({
            img: canvas.current!.getContext('2d')!.getImageData(0, 0, W, H),
            strokes: strokes.current.map((st) => [...st]),
            marked: marked.current,
          });
          if (history.current.length > 30) history.current.shift();
          last.current = pos(e);
          strokes.current.push([last.current]);
          chalk(last.current, last.current);
        }}
        onPointerMove={(e) => {
          if (!last.current) return;
          const p = pos(e);
          strokes.current[strokes.current.length - 1].push(p);
          chalk(last.current, p);
          last.current = p;
        }}
        onPointerUp={() => {
          if (!last.current) return;
          last.current = null;
          save();
          const st = strokes.current[strokes.current.length - 1] ?? [];
          if (onStroke && st.length > 3) {
            const xs = st.map((p) => p.x), ys = st.map((p) => p.y);
            const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
            onStroke(((x0 + x1) / 2 / W) * 100, ((y0 + y1) / 2 / H) * 100, (Math.hypot(x1 - x0, y1 - y0) / W) * 100);
          }
          const mark = detectMark(strokes.current, W);
          if (mark) {
            strokes.current = [];
            marked.current = true;
            onMark(mark);
          }
        }}
      />
      {active && (
        <div className="draw__tools">
          {COLORS.map((c) => (
            <button key={c.id} type="button" className={`draw__tool ${color === c.c ? 'is-on' : ''}`} onClick={() => setColor(c.c)}>
              <PenLine size={14} aria-hidden style={{ color: `rgb(${c.c})` }} /> {c.label}
            </button>
          ))}
          <button type="button" className="draw__tool" onClick={undo}>
            <Undo2 size={14} aria-hidden /> {t('Отменить', 'Deshacer')}
          </button>
          <button type="button" className="draw__tool" onClick={() => {
              canvas.current!.getContext('2d')!.clearRect(0, 0, W, H);
              strokes.current = [];
              onSave('');
            }}>
            <Eraser size={14} aria-hidden /> {t('Стереть', 'Borrar')}
          </button>
          <button
            type="button"
            className="draw__tool draw__tool--done"
            onClick={onClose}
          >
            <Check size={14} aria-hidden /> {t('Готово', 'Listo')}
          </button>
        </div>
      )}
    </>
  );
}
