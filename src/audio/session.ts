import { roomById } from '../rooms'
import type { SoundId } from '../rooms/types'
import { useStore } from '../state/store'

// Media Session : ce que le système affiche (écran verrouillé, notification, touches multimédia) et ce qu'il peut commander.
// Pause coupe l'ambiance en retenant ce qui jouait ; Lecture le remet.
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession
  let held: SoundId[] = []

  const active = () => {
    const s = useStore.getState()
    return roomById(s.room).sounds.filter((x) => s.on[x.id])
  }

  ms.setActionHandler('pause', () => {
    held = active().map((x) => x.id)
    useStore.getState().muteAll()
  })
  ms.setActionHandler('stop', () => useStore.getState().muteAll())
  ms.setActionHandler('play', () => {
    const { sounds } = roomById(useStore.getState().room)
    const ids = held.length ? held : [sounds[0].id]
    useStore.setState((s) => ({ on: { ...s.on, ...Object.fromEntries(ids.map((id) => [id, true])) } }))
  })

  let shown = ''
  const update = () => {
    const s = useStore.getState(), room = roomById(s.room), on = active()
    // Les pistes de la radio ont un titre ; la radio générative change d'accord toutes les mesures, ce n'est pas un titre.
    const title = (s.on.radio && room.playlist.length && s.onAir) || on.map((x) => x.name).join(' · ') || 'Silence'
    const key = `${title}|${room.name}`
    if (key !== shown) {
      shown = key
      const art = (src: string, sizes: string) => ({ src: `${import.meta.env.BASE_URL}${src}`, sizes, type: 'image/png' })
      ms.metadata = new MediaMetadata({ title, artist: room.name, album: 'Chambre Lofi', artwork: [art('icon-192.png', '192x192'), art('icon-512.png', '512x512')] })
    }
    ms.playbackState = on.length ? 'playing' : 'paused'
  }
  useStore.subscribe(update)
}
