import { SphereGeometry } from 'three'

// Des sphères plus légères que SPH (1 400 triangles) pour ce qui se compte par dizaines : le bourrelet de neige du lac, la lanterne
// de boules, les traces de pas, les festons des sapins. Un tas de neige n'a pas besoin de 32 côtés.
export const SPH_MID = new SphereGeometry(1, 20, 12)
export const SPH_LO = new SphereGeometry(1, 12, 8)
