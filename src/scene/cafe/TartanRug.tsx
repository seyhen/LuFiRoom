import { Part, rbox } from '../parts'
import { K } from './materials'

/** Tapis de tartan sous la table des clients. */
export function TartanRug() {
  return <Part geo={rbox(2.9, 0.05, 2.5, 0.03)} m={K.tartan} p={[0.6, 0.025, 0.1]} />
}
