import { useStore, type Store } from '../state/store'

// Écran de chargement : il est déjà dans index.html, affiché pendant que le JS se télécharge.
// Ici, on fait avancer sa barre, puis on l'efface quand tout est prêt : fichiers préchargés (boucles d'ambiance),
// scène dessinée une première fois (shaders compilés) et polices chargées.

const splash = document.getElementById('splash')
if (splash) {
  const bar = splash.querySelector<HTMLElement>('[role=progressbar]')!, root = document.getElementById('root')!
  let fonts = false, closed = false
  root.inert = true // rien d'atteignable au clavier derrière l'écran

  const close = () => {
    if (closed) return
    closed = true
    unsubscribe()
    root.inert = false
    splash.classList.add('out')
    setTimeout(() => splash.remove(), 600)
  }
  const update = ({ loading: { done, total, scene } }: Store) => {
    const p = (done + Number(scene) + Number(fonts)) / (total + 2)
    bar.style.setProperty('--p', String(p))
    bar.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    if (p >= 1) close()
  }
  const unsubscribe = useStore.subscribe(update)
  // Sans les polices au bout de 2.5 s, on y va quand même : le texte s'affichera avec celles du système.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
    fonts = true
    update(useStore.getState())
  })
  // Filet de sécurité (WebGL indisponible, réseau très lent) : le mixeur reste utilisable sans la scène.
  setTimeout(close, 12000)
}
