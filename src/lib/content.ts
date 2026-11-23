/* ==========================================================================
   CONTENIDO SEGÚN EL IDIOMA
   Puerta única a los textos generados (biografía, ejemplo de JM, fechas).
   Ruso: ./narrative, ./demo, ./zodiac · Español: ./es/*
   ========================================================================== */
import * as ruNarrative from './narrative';
import * as esNarrative from './es/narrative';
import * as ruDemo from './demo';
import * as esDemo from './es/demo';
import * as ruZodiac from './zodiac';
import * as esZodiac from './es/zodiac';
import { getLang, type Lang } from './i18n';
import { isUndone } from './realImage';
import type { Memory, Profile } from './types';

const narrative = (lang: Lang = getLang()) => (lang === 'es' ? esNarrative : ruNarrative);
const demo = (lang: Lang = getLang()) => (lang === 'es' ? esDemo : ruDemo);
const zodiac = (lang: Lang = getLang()) => (lang === 'es' ? esZodiac : ruZodiac);

export const { newSeed, visualStateFor, chapterArt, computeStats } = ruNarrative;
export type { Stats } from './narrative';
export const { DEMO_NAME, DEMO_ART, DEMO_FIRST_PHOTO } = ruDemo;

export const introLines = (p: Profile) => narrative().introLines(p);
export const generateBiography = (p: Profile, seed: number, lang: Lang = getLang()) => narrative(lang).generateBiography(p, seed);
export const demoMemories = (lang: Lang = getLang()) => demo(lang).demoMemories();
export const demoProfile = (lang: Lang = getLang()) => demo(lang).DEMO_PROFILE;
export const fechaLarga = (cumple: string) => zodiac().fechaLarga(cumple);
export const parseCumpleanos = (raw: string) => zodiac().parseCumpleanos(raw);

/**
 * Traduce una biografía ya generada: se vuelve a generar con la misma semilla en el
 * otro idioma (elige los mismos recuerdos y fotos) y se conservan las decisiones de la persona.
 */
export function translateMemories(memories: Memory[], profile: Profile, seed: number, isDemo: boolean, to: Lang): Memory[] {
  if (memories.length === 0) return memories;
  const fresh = isDemo ? demoMemories(to) : generateBiography(profile, seed, to);
  const byId = new Map(fresh.map((m) => [m.id, m]));
  return memories.map((old) => {
    const next = byId.get(old.id);
    // Si el recuerdo no coincide (no debería pasar), se deja como estaba.
    if (!next || next.image !== old.image || next.stage !== old.stage) return old;
    // Las palabras tachadas dependen del texto: lo que ya borraron de la foto se guarda como capas borradas.
    const erased = new Set(old.erased ?? []);
    if (old.struck?.length && old.realImage) {
      if (old.layers) {
        for (const l of old.layers) {
          if (isUndone({ ...old, evaluation: 'pendiente', layers: [l], erased: [] })) erased.add(l.id);
        }
      } else if (isUndone({ ...old, evaluation: 'pendiente', erased: [] })) {
        erased.add('todo');
      }
    }
    return {
      ...next,
      evaluation: old.evaluation,
      correction: old.correction,
      visualState: old.visualState,
      drawing: old.drawing,
      struck: [],
      erased: [...erased],
    };
  });
}
