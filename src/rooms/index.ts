import { bedroom } from './bedroom'
import type { Room } from './types'

/** Les pièces, dans l'ordre du sélecteur. La première est celle d'une première visite. */
export const rooms: Room[] = [bedroom]

export const roomById = (id: string) => rooms.find((r) => r.id === id) ?? rooms[0]
