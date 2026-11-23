import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Globe, Menu, X } from 'lucide-react';
import { clearStorage, useExperience } from '../lib/store';
import { DEMO_NAME } from '../lib/content';
import { STAGES } from '../lib/types';
import { scrollToId } from '../lib/visual';
import { ConfirmDialog } from './ConfirmDialog';
import { LANGS, t } from '../lib/i18n';

export const NAV_SECTIONS = [
  { id: 'biografia', get label() { return t('Такой мы видим твою историю', 'Así creemos que fue'); } },
  ...STAGES.map((s) => ({ id: `capitulo-${s.id}`, get label() { return `${s.numero} · ${s.titulo}`; } })),
  { id: 'cambios', get label() { return t('Биография меняется', 'La biografía cambia'); } },
  { id: 'reflexion', get label() { return t('Финал', 'Reflexión final'); } },
];

export function NavigationControls() {
  const { state, dispatch } = useExperience();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inBio = state.phase === 'biografia';
  // Con dos idiomas, el globo cambia directamente al otro.
  const other = LANGS.find((l) => l.id !== state.lang)!;

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
          aria-label={t('По ту сторону кадра. В начало страницы', 'Detrás de la imagen. Volver al inicio de la página')}
        >
          {t('По ту сторону кадра', 'Detrás de la imagen')}
        </button>
        <div className="topbar__actions">
          {state.demo && <span className="topbar__demo">{t('Пример', 'Ejemplo')} · {DEMO_NAME}</span>}
          {inBio && state.currentStage !== 'reflexion' && (
            <button type="button" className="topbar__next" onClick={nextSection}>
              <span>{t('Дальше', 'Siguiente')}</span>
              <ArrowDown size={14} aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="topbar__lang"
            onClick={() => dispatch({ type: 'setLang', lang: other.id })}
            lang={other.id}
            title={other.id === 'es' ? 'Ver en español' : 'Смотреть по-русски'}
            aria-label={other.id === 'es' ? 'Cambiar idioma a español' : 'Сменить язык на русский'}
          >
            <Globe size={18} aria-hidden />
            <span aria-hidden>{other.label}</span>
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="topbar__menu"
            aria-expanded={open}
            aria-controls="panel-navegacion"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span className="sr-only">{open ? t('Закрыть меню', 'Cerrar menú') : t('Открыть меню', 'Abrir menú')}</span>
          </button>
        </div>
      </header>

      <div
        id="panel-navegacion"
        ref={panelRef}
        className={`navpanel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label={t('Навигация', 'Navegación de la experiencia')}
        hidden={!open}
      >
        {inBio ? (
          <nav aria-label={t('Этапы твоей истории', 'Etapas de tu historia')}>
            <p className="navpanel__label">{t('Твоя история', 'Tu historia')}</p>
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
            {t('Этапы твоей истории появятся здесь, когда реконструкция будет готова.', 'Las etapas de tu historia aparecerán aquí cuando la reconstrucción esté lista.')}
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
            <span>{t('Меньше анимации', 'Reducir movimiento')}</span>
          </label>
          <p className="navpanel__privacy">
            {t('Ответы хранятся только в этом браузере. Ничего не отправляется на сервер.', 'Tus respuestas se guardan solo en este navegador. Nada se envía a ningún servidor.')}
          </p>
          {state.demo && (
            <button type="button" className="btn btn--solid btn--small" onClick={wipe}>
              {t('Выйти из примера и создать свою', 'Salir del ejemplo y crear la mía')}
            </button>
          )}
          <button type="button" className="btn btn--line btn--small" onClick={() => setConfirm(true)}>
            {t('Удалить мои данные', 'Borrar mis datos guardados')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title={t('Удалить всё?', '¿Borrar todo?')}
        body={t('Из этого браузера будут удалены твои ответы, биография, решения и правки. Это нельзя отменить.', 'Se eliminarán tus respuestas, la biografía generada, tus decisiones y tus correcciones de este navegador. No se puede deshacer.')}
        confirmLabel={t('Да, удалить', 'Sí, borrar mis datos')}
        onConfirm={wipe}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
