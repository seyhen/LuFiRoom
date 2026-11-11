import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Chaque pièce est un chunk à part : la première visite ne télécharge que le moteur et la pièce courante.
 * Les briques partagées (parts, objects/, nature/…) tombent d'elles-mêmes dans des chunks communs.
 * Ajouter une pièce : une ligne ici (docs/ROOMS.md).
 */
const imports: Record<string, () => Promise<{ default: ComponentType }>> = {
  bedroom: () => import('./bedroom/BedroomScene').then((m) => ({ default: m.BedroomScene })),
  cabin: () => import('./cabin/CabinScene').then((m) => ({ default: m.CabinScene })),
  cafe: () => import('./cafe/CafeScene').then((m) => ({ default: m.CafeScene })),
  beach: () => import('./beach/BeachScene').then((m) => ({ default: m.BeachScene })),
  train: () => import('./train/TrainScene').then((m) => ({ default: m.TrainScene })),
  roof: () => import('./roof/RoofScene').then((m) => ({ default: m.RoofScene })),
  atelier: () => import('./atelier/AtelierScene').then((m) => ({ default: m.AtelierScene })),
  onsen: () => import('./onsen/OnsenScene').then((m) => ({ default: m.OnsenScene })),
  lighthouse: () => import('./lighthouse/LighthouseScene').then((m) => ({ default: m.LighthouseScene })),
  submarine: () => import('./submarine/SubScene').then((m) => ({ default: m.SubScene })),
  market: () => import('./market/MarketScene').then((m) => ({ default: m.MarketScene })),
  igloo: () => import('./igloo/IglooScene').then((m) => ({ default: m.IglooScene })),
  treehouse: () => import('./treehouse/TreehouseScene').then((m) => ({ default: m.TreehouseScene })),
  laundromat: () => import('./laundromat/LaundromatScene').then((m) => ({ default: m.LaundromatScene })),
  greenhouse: () => import('./greenhouse/GreenhouseScene').then((m) => ({ default: m.GreenhouseScene })),
}

const loads = new Map<string, Promise<{ default: ComponentType }>>()

/** Lance (une seule fois) le téléchargement de la scène d'une pièce ; la promesse est partagée avec `React.lazy`. */
export function loadScene(id: string) {
  let p = loads.get(id)
  if (!p) loads.set(id, (p = imports[id]()))
  return p
}

/** La scène 3D de chaque pièce, par identifiant (celui de src/rooms/*.ts), chargée à la demande : à poser dans une <Suspense>. */
export const scenes: Record<string, LazyExoticComponent<ComponentType>> = Object.fromEntries(
  Object.keys(imports).map((id) => [id, lazy(() => loadScene(id))]),
)
