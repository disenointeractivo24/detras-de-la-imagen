import { Check, HelpCircle, X } from 'lucide-react';
import type { Evaluation } from '../lib/types';

interface Props {
  id: string;
  value: Evaluation;
  onChange: (e: Evaluation) => void;
}

const OPTIONS: { value: Evaluation; label: string; Icon: typeof Check }[] = [
  { value: 'confirmado', label: 'Да, это было.', Icon: Check },
  { value: 'rechazado', label: 'Нет, этого не было.', Icon: X },
  { value: 'incierto', label: 'Не уверен.', Icon: HelpCircle },
];

/** Las tres respuestas posibles ante un recuerdo. La persona decide; el sistema nunca clasifica. */
export function MemoryDecision({ id, value, onChange }: Props) {
  return (
    <fieldset className="decision">
      <legend className="decision__q" id={`pregunta-${id}`}>
        Это правда было?
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
