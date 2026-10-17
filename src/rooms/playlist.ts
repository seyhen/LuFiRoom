import type { Track } from './types'

/**
 * Les morceaux de la radio, les mêmes dans toutes les pièces, joués dans un ordre mélangé (sources et crédits : public/audio/CREDITS.md).
 * Tempo et premier temps mesurés sur les fichiers : ils font pulser la radio dans la scène.
 */
export const PLAYLIST: Track[] = [
  { src: 'audio/radio/velvet-lounge', title: 'Velvet Lounge', artist: 'RhythmicInk', bpm: 78, beat: 0.74 },
  { src: 'audio/radio/tape-drift', title: 'Tape Drift', artist: 'RhythmicInk', bpm: 64, beat: 0.89 },
  { src: 'audio/radio/matcha-groove', title: 'Matcha Groove', artist: 'RhythmicInk', bpm: 82, beat: 0 },
  { src: 'audio/radio/matcha-groove-2', title: 'Matcha Groove II', artist: 'RhythmicInk', bpm: 82, beat: 0.02 },
  { src: 'audio/radio/dusty-keys', title: 'Dusty Keys', artist: 'RhythmicInk', bpm: 82, beat: 0.71 },
  { src: 'audio/radio/midnight-drift', title: 'Midnight Drift', artist: 'RhythmicInk', bpm: 74, beat: 0.8 },
  { src: 'audio/radio/melancholic-jazz', title: 'Melancholic Lo-Fi Jazz Cover', artist: 'RhythmicInk', bpm: 74, beat: 0.37 },
]
