import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Menu, X } from 'lucide-react';
import { clearStorage, useExperience } from '../lib/store';
import { DEMO_NAME } from '../lib/demo';
import { STAGES } from '../lib/types';
import { scrollToId } from '../lib/visual';
import { ConfirmDialog } from './ConfirmDialog';

export const NAV_SECTIONS = [
  { id: 'biografia', label: 'Такой мы видим твою историю' },
  ...STAGES.map((s) => ({ id: `capitulo-${s.id}`, label: `${s.numero} · ${s.titulo}` })),
  { id: 'cambios', label: 'Биография меняется' },
  { id: 'reflexion', label: 'Финал' },
];

export function NavigationControls() {
  const { state, dispatch } = useExperience();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inBio = state.phase === 'biografia';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id, state.reducedMotion);
  };

  const nextSection = () => {
    const idx = NAV_SECTIONS.findIndex((s) => s.id === state.currentStage);
    const next = NAV_SECTIONS[Math.min(NAV_SECTIONS.length - 1, idx + 1)];
    scrollToId(next.id, state.reducedMotion);
  };

  const wipe = () => {
    clearStorage();
    dispatch({ type: 'reset' });
    setConfirm(false);
    setOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="topbar__brand"
          onClick={() => window.scrollTo({ top: 0, behavior: state.reducedMotion ? 'auto' : 'smooth' })}
          aria-label="По ту сторону кадра. В начало страницы"
        >
          По ту сторону кадра
        </button>
        <div className="topbar__actions">
          {state.demo && <span className="topbar__demo">Пример · {DEMO_NAME}</span>}
          {inBio && state.currentStage !== 'reflexion' && (
            <button type="button" className="topbar__next" onClick={nextSection}>
              <span>Дальше</span>
              <ArrowDown size={14} aria-hidden />
            </button>
          )}
          <button
            ref={toggleRef}
            type="button"
            className="topbar__menu"
            aria-expanded={open}
            aria-controls="panel-navegacion"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span className="sr-only">{open ? 'Закрыть меню' : 'Открыть меню'}</span>
          </button>
        </div>
      </header>

      <div
        id="panel-navegacion"
        ref={panelRef}
        className={`navpanel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="Навигация"
        hidden={!open}
      >
        {inBio ? (
          <nav aria-label="Этапы твоей истории">
            <p className="navpanel__label">Tu historia</p>
            <ol className="navpanel__list">
              {NAV_SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={state.currentStage === s.id ? 'is-current' : ''}
                    aria-current={state.currentStage === s.id ? 'step' : undefined}
                    onClick={() => go(s.id)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <p className="navpanel__note">
            Этапы твоей истории появятся здесь, когда реконструкция будет готова.
          </p>
        )}

        <div className="navpanel__settings">
          <label className="switch">
            <input
              type="checkbox"
              checked={state.reducedMotion}
              onChange={(e) => dispatch({ type: 'setReducedMotion', value: e.target.checked })}
            />
            <span className="switch__track" aria-hidden />
            <span>Меньше анимации</span>
          </label>
          <p className="navpanel__privacy">
            Ответы хранятся только в этом браузере. Ничего не отправляется на сервер.
          </p>
          {state.demo && (
            <button type="button" className="btn btn--solid btn--small" onClick={wipe}>
              Выйти из примера и создать свою
            </button>
          )}
          <button type="button" className="btn btn--line btn--small" onClick={() => setConfirm(true)}>
            Удалить мои данные
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Удалить всё?"
        body="Из этого браузера будут удалены твои ответы, биография, решения и правки. Это нельзя отменить."
        confirmLabel="Да, удалить"
        onConfirm={wipe}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
