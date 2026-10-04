import type { ComponentType } from 'react'
import { BedroomScene } from './bedroom/BedroomScene'
import { CabinScene } from './cabin/CabinScene'
import { CafeScene } from './cafe/CafeScene'
import { BeachScene } from './beach/BeachScene'
import { TrainScene } from './train/TrainScene'
import { RoofScene } from './roof/RoofScene'
import { AtelierScene } from './atelier/AtelierScene'
import { OnsenScene } from './onsen/OnsenScene'
import { LighthouseScene } from './lighthouse/LighthouseScene'
import { SubScene } from './submarine/SubScene'
import { MarketScene } from './market/MarketScene'

/** La scène 3D de chaque pièce, par identifiant (celui de src/rooms/*.ts). */
export const scenes: Record<string, ComponentType> = {
  bedroom: BedroomScene,
  cabin: CabinScene,
  cafe: CafeScene,
  beach: BeachScene,
  train: TrainScene,
  roof: RoofScene,
  atelier: AtelierScene,
  onsen: OnsenScene,
  lighthouse: LighthouseScene,
  submarine: SubScene,
  market: MarketScene,
}
