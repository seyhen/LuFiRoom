// La météo : on la choisit dans le sélecteur de la barre du haut (src/ui/WeatherPicker.tsx), dans toutes les pièces.
// Elle se joue sur le son `rain` de la pièce (la carte « Météo » du mixeur) : carte allumée, la météo choisie ; éteinte, « Dégagé ».
// Ce qu'elle change, du son au décor : docs/WEATHER.md.

/** Les météos qui font un son. « Dégagé » n'en est pas une : c'est la carte « Météo » éteinte. */
export type WeatherKind = 'drizzle' | 'rain' | 'storm' | 'snow' | 'blizzard'
/** Ce qu'on voit et entend dehors. */
export type Sky = WeatherKind | 'clear'

export const WEATHER_KINDS: WeatherKind[] = ['drizzle', 'rain', 'storm', 'snow', 'blizzard']

/** Les noms, dans l'ordre du sélecteur (traduits dans src/i18n.ts). */
export const SKY_NAMES: Record<Sky, string> = {
  clear: 'Dégagé',
  drizzle: 'Bruine',
  rain: 'Pluie',
  storm: 'Orage',
  snow: 'Neige',
  blizzard: 'Tempête de neige',
}

export const isWeather = (v: unknown): v is WeatherKind => WEATHER_KINDS.includes(v as WeatherKind)

/** La météo qu'on voit et entend : celle choisie si la carte « Météo » joue, sinon un ciel dégagé. */
export const skyOf = (s: { on: { rain: boolean }; weather: WeatherKind }): Sky => (s.on.rain ? s.weather : 'clear')

/** Mouillé (gouttes sur les vitres, flaques, ciel gris) : 0 → 1. */
export const wetOf = (sky: Sky) => (sky === 'drizzle' ? 0.55 : sky === 'rain' || sky === 'storm' ? 1 : 0)
/** Enneigé (ciel blanc, flocons dehors) : 0 → 1. */
export const snowOf = (sky: Sky) => (sky === 'snow' ? 0.7 : sky === 'blizzard' ? 1 : 0)
