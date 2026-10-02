import { bedroom } from './bedroom'
import { cabin } from './cabin'
import type { Room } from './types'

/** Les pièces, dans l'ordre du sélecteur. La première est celle d'une première visite. */
export const rooms: Room[] = [bedroom, cabin]

export const roomById = (id: string) => rooms.find((r) => r.id === id) ?? rooms[0]
