import { bedroom } from './bedroom'
import { cabin } from './cabin'
import { cafe } from './cafe'
import { beach } from './beach'
import { train } from './train'
import { roof } from './roof'
import { atelier } from './atelier'
import { onsen } from './onsen'
import { lighthouse } from './lighthouse'
import { submarine } from './submarine'
import { market } from './market'
import type { Room } from './types'

/** Les pièces, dans l'ordre du sélecteur. La première est celle d'une première visite. */
export const rooms: Room[] = [bedroom, cabin, cafe, beach, train, roof, atelier, onsen, lighthouse, submarine, market]

export const roomById = (id: string) => rooms.find((r) => r.id === id) ?? rooms[0]
