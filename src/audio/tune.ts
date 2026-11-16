import type { Room, SoundId } from '../rooms/types'

/**
 * Réglage propre à la pièce d'un son synthétisé : la fiche (`tune` dans `src/rooms/<pièce>.ts`) donne les nombres, le canal garde
 * son défaut quand ils manquent. Sert à ce que deux pièces qui ont le même son (ronron, feu, vent…) ne partagent pas la même
 * synthèse de repli (docs/SOUNDS.md). Sans effet sur les enregistrements.
 */
export const tune = (room: Room, id: SoundId, key: string, fallback: number) => room.tune?.[id]?.[key] ?? fallback
