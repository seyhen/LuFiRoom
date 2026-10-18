import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../math'
import { reduceMotion } from './anim'

/** La lumière d'un éclair (0 → 1), qui retombe vite : <Lights> l'écrit et l'ajoute à l'éclairage, App la lit pour le ciel. */
export const life = {
  flash: 0,
  // `?fast` dans l'adresse, en développement seulement : les évènements reviennent dix fois plus vite, pour les voir sans attendre.
  speed: import.meta.env.DEV && new URLSearchParams(location.search).has('fast') ? 0.1 : 1,
}

/**
 * Fait revenir un évènement de temps en temps : `run` est appelé toutes les `min` à `max` secondes (la première fois au bout de `first`
 * à `max`), tant que `when()` est vrai. Rien avec `prefers-reduced-motion`, ni quand l'onglet est caché.
 */
export function useEvery(min: number, max: number, run: () => void, when: () => boolean = () => true, first = min * 0.4) {
  const left = useRef(rand(first, max) * life.speed)
  useFrame((_, delta) => {
    if (reduceMotion || document.visibilityState !== 'visible' || !when()) return
    left.current -= Math.min(delta, 0.1)
    if (left.current <= 0) {
      left.current = rand(min, max) * life.speed
      run()
    }
  })
}
