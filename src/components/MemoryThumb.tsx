import { shownImage } from '../lib/realImage';
import { Check, HelpCircle, X } from 'lucide-react';
import type { Memory } from '../lib/types';
import { formatAge, imgAttrs, tornClip } from '../lib/visual';

interface Props {
  memory: Memory;
  index: number;
  /** 'generada' muestra siempre la versión original; 'tuya' refleja las decisiones. */
  version: 'generada' | 'tuya';
  compact?: boolean;
}

export const EVAL_LABEL: Record<Memory['evaluation'], string> = {
  pendiente: 'Не проверено',
  confirmado: 'Узнано',
  rechazado: 'Не было',
  incierto: 'Не подтверждено',
};

/** Una página del álbum: la misma pieza sirve para la historia generada y para la tuya. */
export function MemoryThumb({ memory: m, index, version, compact }: Props) {
  const state = version === 'generada' ? 'completo' : m.visualState;
  const pending = version === 'tuya' && m.evaluation === 'pendiente';
  return (
    <div className={`thumb ${compact ? 'thumb--compact' : ''} ${pending ? 'is-pending' : ''}`} data-state={state}>
      <div className="thumb__frame" style={{ clipPath: tornClip(index + 60, 2.2, ['top', 'bottom', 'right']) }}>
        {state === 'vacio' || state === 'corregido' ? (
          <div className="thumb__paper">
            {state === 'corregido' ? <p className="thumb__hand">{m.correction}</p> : <X className="thumb__x" size={34} strokeWidth={1} aria-hidden />}
          </div>
        ) : (
          <img {...imgAttrs(shownImage(m), "400px")} alt="" loading="lazy" />
        )}
      </div>
      <div className="thumb__caption">
        <span className="thumb__age">{formatAge(m.approxAge)}</span>
        {version === 'tuya' && (
          <span className={`thumb__badge thumb__badge--${m.evaluation}`}>
            {m.evaluation === 'confirmado' && <Check size={11} aria-hidden />}
            {m.evaluation === 'rechazado' && <X size={11} aria-hidden />}
            {m.evaluation === 'incierto' && <HelpCircle size={11} aria-hidden />}
            {state === 'corregido' ? 'Corregido' : EVAL_LABEL[m.evaluation]}
          </span>
        )}
      </div>
      {!compact && (
        <p className="thumb__text">
          {version === 'tuya' && state === 'vacio'
            ? 'Это воспоминание не из твоей истории.'
            : version === 'tuya' && state === 'corregido'
              ? `«${m.correction}»`
              : m.statement}
        </p>
      )}
    </div>
  );
}
