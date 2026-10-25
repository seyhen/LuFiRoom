// Le jour et la nuit suivent l'heure réelle : nuit de 20 h à 7 h (heure locale), comme dans le prototype.
// La règle de la main (lampe, bouton jour / nuit, ambiance jouée) : un choix contraire à l'horloge tient jusqu'au prochain
// changement de période (7 h ou 20 h), puis la pièce suit de nouveau l'heure. Un choix qui va dans le sens de l'horloge la laisse
// suivre l'heure, tout simplement. Voir docs/ROOMS.md (« Jour / nuit »).

export const NIGHT_FROM = 20
export const DAY_FROM = 7
/** Durée d'un passage jour / nuit fait par l'horloge (le crépuscule ou l'aube), en secondes. À la main, il dure moins d'une seconde. */
export const DUSK = 40

/** Fait-il nuit à cette heure-là ? */
export const clockNight = (d = new Date()) => {
  const h = d.getHours()
  return h >= NIGHT_FROM || h < DAY_FROM
}

/** Le prochain changement de période (7 h ou 20 h, heure locale) après `d`, en ms. */
export function nextTurn(d = new Date()) {
  const t = new Date(d.getTime())
  const h = d.getHours()
  t.setMinutes(0, 0, 0)
  if (h < DAY_FROM) t.setHours(DAY_FROM)
  else if (h < NIGHT_FROM) t.setHours(NIGHT_FROM)
  else {
    t.setDate(t.getDate() + 1)
    t.setHours(DAY_FROM)
  }
  return t.getTime()
}

/** Ce que tient un choix de la main : jusqu'au prochain changement de période s'il va contre l'horloge, rien sinon. */
export const holdFor = (night: boolean, now = new Date()) => (night === clockNight(now) ? null : nextTurn(now))
