export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
/** Écran tactile (téléphone, tablette) : moins de pixels et des ombres plus petites pour tenir 60 images/s. */
export const coarsePointer = matchMedia('(pointer: coarse)').matches
