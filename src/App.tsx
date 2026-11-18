import { useEffect, useLayoutEffect } from 'react';
import { BiographyTimeline } from './components/BiographyTimeline';
import { BiographyTransformation } from './components/BiographyTransformation';
import { ExperienceLayout } from './components/ExperienceLayout';
import { IdentityQuestionnaire } from './components/IdentityQuestionnaire';
import { IntroExperience } from './components/IntroExperience';
import { ReconstructionSequence } from './components/ReconstructionSequence';
import { ReflectionScene } from './components/ReflectionScene';
import { ScrollProgress } from './components/ScrollProgress';
import { useExperience } from './lib/store';
import { ScrollTrigger, scrollToId } from './lib/visual';

function useSectionTracking(enabled: boolean) {
  const { dispatch } = useExperience();
  useEffect(() => {
    if (!enabled) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) dispatch({ type: 'setStage', stage: e.target.id });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [enabled, dispatch]);
}

export default function App() {
  const { state } = useExperience();
  const { phase, memories, reducedMotion } = state;
  const inBio = phase === 'biografia';
  useSectionTracking(inBio);

  // Cuando cambian las decisiones, la altura de los recuerdos cambia: recalculamos los ScrollTriggers.
  const layoutKey = memories.map((m) => `${m.evaluation}:${m.correction.length > 0}`).join('|');
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [layoutKey, phase, reducedMotion]);

  // El final es claro: la viñeta oscura se suaviza.
  useEffect(() => {
    document.documentElement.classList.toggle('is-light', inBio && state.currentStage === 'reflexion');
  }, [inBio, state.currentStage]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // Al volver a una sesión guardada, retomamos la última etapa visitada.
  useLayoutEffect(() => {
    if (inBio && state.currentStage && state.currentStage !== 'biografia') {
      const target = state.currentStage;
      const t = window.setTimeout(() => scrollToId(target, true), 120);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inBio]);

  return (
    <ExperienceLayout>
      {phase === 'intro' && (
        <>
          <IntroExperience />
          <IdentityQuestionnaire />
        </>
      )}
      {phase === 'reconstruccion' && <ReconstructionSequence />}
      {inBio && (
        <>
          <BiographyTimeline />
          <BiographyTransformation />
          <ReflectionScene />
          <ScrollProgress />
        </>
      )}
    </ExperienceLayout>
  );
}
