// Les repères de la cabine. Le fuselage court le long de x et l'avant de l'avion est vers +x : les sièges regardent donc la caméra
// (qui voit les faces +x et +z). Le mur du fond (z = -3) est le flanc de l'avion, percé de hublots ; le mur de gauche (x = -3) est la
// cloison arrière (office, rideau, toilettes). Deux rangées de sièges contre le flanc, un couloir, un bloc de deux sièges côté allée.

/** Le centre de chaque rangée, sur x (le dossier est 0,4 derrière, l'assise 0,3 devant). */
export const ROW_X = [-1.5, 0.9]
/** Les sièges du flanc : A (hublot), B, C (couloir), puis, de l'autre côté de l'allée, D et E ; leur centre sur z. */
export const SEAT_Z = { A: -2.3, B: -1.42, C: -0.54, D: 1.62, E: 2.5 }
/** L'allée : de z = -0,1 (accoudoir du siège C) à 1,2 (le siège D). */
export const AISLE = { z0: -0.1, z1: 1.2 }
/** L'intérieur des murs. */
export const IN = -3.0
/** Les hublots : un par rangée, alignés sur le siège A ; centre sur x, bas et haut sur y. */
export const PORTS = [{ x: -1.7, y0: 1.32, y1: 2.18, w: 0.6 }, { x: 0.7, y0: 1.32, y1: 2.18, w: 0.6 }]
/** La porte de secours du bout du flanc : son hublot. */
export const EXIT_DOOR = { x0: 1.95, x1: 3.05, h: 2.9, win: { x: 2.5, y0: 1.7, y1: 2.3, w: 0.34 } }
/** Le dessous des coffres à bagages (le dessus des panneaux de plafond). */
export const BIN = { y0: 3.1, y1: 4.1, depth: 0.62 }
