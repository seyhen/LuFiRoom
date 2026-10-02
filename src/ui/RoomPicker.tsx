import { rooms } from '../rooms'
import { useStore } from '../state/store'

/** Choix de la pièce : une puce par pièce, de vrais boutons. Rien à choisir tant qu'il n'y en a qu'une. */
export function RoomPicker() {
  const current = useStore((s) => (s.leaving ?? s.room))
  if (rooms.length < 2) return null
  return (
    <div className="rooms" role="group" aria-label="Choisir une pièce">
      {rooms.map((r) => (
        <button key={r.id} type="button" className="room" aria-pressed={r.id === current} onClick={() => useStore.getState().goto(r.id)}>
          {r.name}
        </button>
      ))}
    </div>
  )
}
