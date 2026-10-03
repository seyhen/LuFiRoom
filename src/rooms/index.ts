import { bedroom } from './bedroom'
import { cabin } from './cabin'
import { cafe } from './cafe'
import { beach } from './beach'
import { train } from './train'
import { roof } from './roof'
import { atelier } from './atelier'
import type { Room } from './types'

/** Les pièces, dans l'ordre du sélecteur. La première est celle d'une première visite. */
export const rooms: Room[] = [bedroom, cabin, cafe, beach, train, roof, atelier]

export const roomById = (id: string) => rooms.find((r) => r.id === id) ?? rooms[0]
