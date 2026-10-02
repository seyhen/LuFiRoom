// Le format d'une pièce. Une pièce est une donnée : ses objets interactifs, les sons qu'ils pilotent, ses enregistrements,
// sa palette et sa lumière. Le moteur (scène, audio, interface) lit ces données ; sa scène 3D est associée dans
// src/scene/scenes.ts. Pour en ajouter une : docs/ROOMS.md.

/** Un son du mixeur. Le moteur a un canal par identifiant (src/audio/engine.ts). */
export type SoundId = 'radio' | 'rain' | 'fan' | 'purr' | 'outside' | 'fire' | 'wind'
/** Un objet interactif de la scène. */
export type ObjectId = 'cloud' | 'radio' | 'turntable' | 'window' | 'fan' | 'cat' | 'lamp' | 'fireplace'
/** Ce qu'un objet pilote : un son, ou le passage jour / nuit. */
export type Target = SoundId | 'night'

export type V3 = [number, number, number]
/** Une valeur de jour, puis la même de nuit. */
export type DayNight<T> = [day: T, night: T]

export interface RoomObject {
  id: ObjectId
  target: Target
  /** Bulle du hotspot, et son nom accessible. */
  label: string
  /** Position du hotspot, dans le repère de la pièce. */
  anchor: V3
}

export interface RoomSound {
  id: SoundId
  name: string
  /** Couleur de la pastille dans le mixeur. */
  chip: string
  /** Icône de la carte, si ce n'est pas celle du son (un tourne-disque est un son « radio » à l'oreille, mais pas à l'œil). */
  icon?: 'vinyl'
  /** Nom du bouton qui change la musique de la carte « radio » (« Station suivante » par défaut). */
  skip?: string
  /** Volume par défaut (0 → 1). */
  volume: number
  /** Sous-titre vivant de la carte du mixeur. */
  sub: (s: { night: boolean; on: Record<SoundId, boolean>; onAir: string; station: string }) => string
}

/** Une boucle d'ambiance enregistrée. */
export interface Loop {
  /** Chemin sous `public/`, sans extension. */
  src: string
  /**
   * Niveau dans le mélange. Les fichiers sortent tous de `npm run audio` à la même sonie (-20 LUFS) : c'est ce gain
   * qui fait qu'un ronron reste plus discret que la pluie. Points de départ dans docs/ASSETS.md.
   */
  gain: number
}

export type Loops = Partial<Record<'rain' | 'fan' | 'purr' | 'birds' | 'crickets' | 'fire' | 'wind', Loop>>

/** Une piste de la radio. */
export interface Track {
  /** Chemin sous `public/`, sans extension. Les pistes sortent aussi à -20 LUFS. */
  src: string
  title: string
  artist: string
  /** Tempo : la radio pulse tous les deux temps. */
  bpm: number
  /** Instant du premier temps, en secondes (0 par défaut). */
  beat?: number
}

/** Les couleurs d'interface qu'une pièce peut changer (noms des variables CSS de tokens.css). */
export type UiToken = 'accent' | 'ink' | 'ink-soft' | 'panel' | 'line' | 'bg'

export interface Room {
  /** Identifiant stable (clé de la scène, mémorisé entre deux visites). */
  id: string
  /** Nom affiché dans le sélecteur de pièce. */
  name: string
  /** Description de la scène pour les lecteurs d'écran. */
  description: string
  /** Dans l'ordre des hotspots : ordre de tabulation et décalage de leur pulsation. */
  objects: RoomObject[]
  /** Dans l'ordre du mixeur. */
  sounds: RoomSound[]
  /**
   * Enregistrements de la pièce, chemins sous `public/`, sans extension. Chaque fichier existe en `.webm` (Opus) et en `.mp3`
   * (repli) : `npm run audio` les produit, voir docs/ASSETS.md. Un son sans enregistrement reste synthétisé.
   * Le dehors n'utilise ses enregistrements que si les oiseaux (jour) et les grillons (nuit) sont là.
   */
  loops: Loops
  /** Les stations de la radio générative de la pièce (identifiants de src/audio/stations.ts), dans l'ordre : la première est celle d'une première visite. Toutes par défaut. */
  stations?: string[]
  /** Pistes de la radio, jouées dans un ordre mélangé. Sans piste, la radio joue sa musique générative. */
  playlist: Track[]
  /** Couleurs d'interface propres à la pièce, de jour puis de nuit. Celles qui manquent gardent la teinte de base. */
  ui?: Partial<Record<UiToken, DayNight<string>>>
  /** Ciel du fond (dégradé radial : centre, milieu, bord), de jour puis de nuit. */
  sky: { day: [string, string, string]; night: [string, string, string] }
  /** Lumières : ciel et sol de l'hémisphérique, soleil (ou lune). Couleurs hexadécimales, intensités avant × π. */
  light: {
    hemi: { sky: DayNight<number>; ground: DayNight<number>; intensity: DayNight<number> }
    sun: { color: DayNight<number>; intensity: DayNight<number> }
  }
  /** Objet dont l'activation assombrit la pièce (la pluie). */
  dimmedBy?: ObjectId
}
