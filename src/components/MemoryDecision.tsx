import { Check, HelpCircle, X } from 'lucide-react';
import type { Evaluation } from '../lib/types';
import { t } from '../lib/i18n';

interface Props {
  id: string;
  value: Evaluation;
  onChange: (e: Evaluation) => void;
}

const OPTIONS: { value: Evaluation; label: string; Icon: typeof Check }[] = [
  { value: 'confirmado', get label() { return t('Да, это было.', 'Sí, pasó.'); }, Icon: Check },
  { value: 'rechazado', get label() { return t('Нет, этого не было.', 'No, eso nunca pasó.'); }, Icon: X },
  { value: 'incierto', get label() { return t('Не уверен.', 'No estoy seguro.'); }, Icon: HelpCircle },
];

/** Las tres respuestas posibles ante un recuerdo. La persona decide; el sistema nunca clasifica. */
export function MemoryDecision({ id, value, onChange }: Props) {
  return (
    <fieldset className="decision">
      <legend className="decision__q" id={`pregunta-${id}`}>
        {t('Это правда было?', '¿Esto realmente pasó?')}
      </legend>
      <div className="decision__options">
        {OPTIONS.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            className={`decision__btn decision__btn--${v} ${value === v ? 'is-selected' : ''}`}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            <Icon size={15} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
