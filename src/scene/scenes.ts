import type { ComponentType } from 'react'
import { BedroomScene } from './rooms/BedroomScene'

/** La scène 3D de chaque pièce, par identifiant (celui de src/rooms/*.ts). */
export const scenes: Record<string, ComponentType> = {
  bedroom: BedroomScene,
}
