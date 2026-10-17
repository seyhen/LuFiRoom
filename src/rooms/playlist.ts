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
  { src: 'audio/radio/quiet-corner', title: 'Quiet Corner', artist: 'RhythmicInk', bpm: 75, beat: 0.0 },
  { src: 'audio/radio/quiet-corner-2', title: 'Quiet Corner II', artist: 'RhythmicInk', bpm: 60, beat: 0.98 },
  { src: 'audio/radio/quiet-corner-3', title: 'Quiet Corner III', artist: 'RhythmicInk', bpm: 73, beat: 0.79 },
  { src: 'audio/radio/soft-focus', title: 'Soft Focus', artist: 'RhythmicInk', bpm: 64, beat: 0.89 },
  { src: 'audio/radio/soft-focus-2', title: 'Soft Focus II', artist: 'RhythmicInk', bpm: 75, beat: 0.79 },
  { src: 'audio/radio/soft-focus-3', title: 'Soft Focus III', artist: 'RhythmicInk', bpm: 90, beat: 0.63 },
  { src: 'audio/radio/warm-cadence', title: 'Warm Cadence', artist: 'RhythmicInk', bpm: 60, beat: 0.71 },
  { src: 'audio/radio/warm-vinyl', title: 'Warm Vinyl', artist: 'RhythmicInk', bpm: 75, beat: 0.79 },
  { src: 'audio/radio/velvet-keys', title: 'Velvet Keys', artist: 'RhythmicInk', bpm: 60, beat: 0.98 },
  { src: 'audio/radio/velvet-drift', title: 'Velvet Drift', artist: 'RhythmicInk', bpm: 90, beat: 0.63 },
  { src: 'audio/radio/dusty-keys-2', title: 'Dusty Keys II', artist: 'RhythmicInk', bpm: 75, beat: 0.01 },
  { src: 'audio/radio/corner-booth', title: 'Corner Booth', artist: 'RhythmicInk', bpm: 60, beat: 0.98 },
  { src: 'audio/radio/corner-seat', title: 'Corner Seat', artist: 'RhythmicInk', bpm: 81, beat: 0.01 },
  { src: 'audio/radio/quiet-desk', title: 'Quiet Desk', artist: 'RhythmicInk', bpm: 76, beat: 0.77 },
  { src: 'audio/radio/dusk-in-kyoto', title: 'Dusk in Kyoto', artist: 'RhythmicInk', bpm: 76, beat: 0.01 },
  { src: 'audio/radio/tokyo-dusk', title: 'Tokyo Dusk', artist: 'RhythmicInk', bpm: 60, beat: 0.96 },
  { src: 'audio/radio/shibuya-drizzle', title: 'Shibuya Drizzle', artist: 'RhythmicInk', bpm: 75, beat: 0.78 },
  { src: 'audio/radio/rain-on-glass', title: 'Rain On Glass', artist: 'RhythmicInk', bpm: 90, beat: 0.64 },
  { src: 'audio/radio/tokyo-drizzle', title: 'Tokyo Drizzle', artist: 'RhythmicInk', bpm: 60, beat: 1.0 },
  { src: 'audio/radio/kyoto-drizzle', title: 'Kyoto Drizzle', artist: 'RhythmicInk', bpm: 60, beat: 0.98 },
  { src: 'audio/radio/gentle-drizzle', title: 'Gentle Drizzle', artist: 'RhythmicInk', bpm: 64, beat: 0.93 },
]
