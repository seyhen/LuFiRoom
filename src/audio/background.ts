import { ForegroundService, Importance } from '@capawesome-team/capacitor-android-foreground-service'
import { roomById } from '../rooms'
import { useStore } from '../state/store'
import { tr, useLang } from '../i18n'

// L'app Android seulement (chargé par main.tsx sur cette plateforme) : un service de premier plan « lecture de médias » tant qu'un
// son joue, pour qu'Android ne coupe pas l'ambiance quand l'écran est éteint depuis quelques minutes. Il montre une notification
// discrète (le nom de la pièce, un bouton Pause) ; il s'arrête dès que tout se tait (silence, minuteur, Pause).
// Le type du service (`mediaPlayback`) est déclaré dans android/app/src/main/AndroidManifest.xml. Voir docs/MOBILE.md.

const CHANNEL = 'ambiance', NOTIF = 1, PAUSE = 1

let ready: Promise<void> | null = null
/** Une seule fois : le canal de notification (silencieux), le bouton Pause, et la permission d'afficher (Android 13+). */
const setup = () =>
  (ready ??= (async () => {
    await ForegroundService.createNotificationChannel({ id: CHANNEL, name: tr('Ambiance en cours'), description: tr('Le son continue quand l’écran est éteint'), importance: Importance.Low })
    await ForegroundService.addListener('buttonClicked', ({ buttonId }) => {
      if (buttonId === PAUSE) useStore.getState().muteAll()
    })
    // Refusée, la notification ne s'affiche pas, mais le service garde quand même le son.
    if ((await ForegroundService.checkPermissions()).display === 'prompt') await ForegroundService.requestPermissions().catch(() => undefined)
  })())

let running = false, shown = ''
async function sync() {
  const s = useStore.getState(), room = roomById(s.room)
  if (!room.sounds.some((x) => s.on[x.id])) {
    if (running) {
      running = false
      shown = ''
      await ForegroundService.stopForegroundService()
    }
    return
  }
  const body = tr(room.name), key = `${body}|${useLang.getState().lang}`
  if (running && key === shown) return
  await setup()
  const opts = { id: NOTIF, title: 'LufiRoom', body, smallIcon: 'ic_stat_lufiroom', silent: true, notificationChannelId: CHANNEL, buttons: [{ id: PAUSE, title: tr('Mettre en pause') }] }
  shown = key
  if (running) await ForegroundService.updateForegroundService(opts)
  else {
    running = true
    await ForegroundService.startForegroundService(opts)
  }
}

// Les appels au natif se suivent dans l'ordre (allumer puis éteindre vite ne doit pas laisser le service tourner).
let chain = Promise.resolve()
const queue = () => {
  chain = chain.then(sync).catch((e) => console.warn('Service de lecture :', e))
}
useStore.subscribe((s, p) => {
  if (s.on !== p.on || s.room !== p.room) queue()
})
useLang.subscribe(queue)
