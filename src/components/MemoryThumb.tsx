import { shownImage } from '../lib/realImage';
import { Check, HelpCircle, X } from 'lucide-react';
import type { Memory } from '../lib/types';
import { formatAge, imgAttrs, tornClip } from '../lib/visual';
import { t } from '../lib/i18n';

interface Props {
  memory: Memory;
  index: number;
  /** 'generada' muestra siempre la versión original; 'tuya' refleja las decisiones. */
  version: 'generada' | 'tuya';
  compact?: boolean;
}

export const EVAL_LABEL: Record<Memory['evaluation'], string> = {
  get pendiente() { return t('Не проверено', 'Sin revisar'); },
  get confirmado() { return t('Узнано', 'Reconocido'); },
  get rechazado() { return t('Не было', 'Nunca pasó'); },
  get incierto() { return t('Не подтверждено', 'Sin confirmar'); },
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
            {state === 'corregido' ? t('Исправлено', 'Corregido') : EVAL_LABEL[m.evaluation]}
          </span>
        )}
      </div>
      {!compact && (
        <p className="thumb__text">
          {version === 'tuya' && state === 'vacio'
            ? t('Это воспоминание не из твоей истории.', 'Este recuerdo no pertenece a tu historia.')
            : version === 'tuya' && state === 'corregido'
              ? `«${m.correction}»`
              : m.statement}
        </p>
      )}
    </div>
  );
}
