# Sons répétés d'une pièce à l'autre (revue du 2026-11-16)

Règle (`CLAUDE.md`, « Sons ») : pas de son répété d'une pièce à l'autre, sauf la météo (`rain`) et la carte « Bruit » (`noise`).
Un même identifiant avec un enregistrement propre à chaque pièce n'est **pas** une répétition ; le **même fichier**, ou la **même synthèse**, dans deux pièces en est une.

## Ce qui est partagé

| Son | Pièce | Source réelle | Répétition ? |
|---|---|---|---|
| `wind` | cabane | `audio/cabin/wind` | non |
| | toit | `audio/roof/wind` | **oui** : même fichier que le phare et la cabane perchée |
| | phare | `audio/roof/wind` | **oui** |
| | cabane perchée | `audio/roof/wind` | **oui** (repli : voix propre, voir plus bas) |
| `fire` | cabane | `audio/cabin/fire` | non |
| | café | `audio/cafe/fire` | non |
| | phare | `audio/lighthouse/fire` | non |
| | toit | `audio/cafe/fire` | **oui** : même fichier que le café |
| `purr` | chambre | `audio/bedroom/purr` | non |
| | cabane | `audio/bedroom/purr` | **oui** : même fichier que la chambre |
| | plage | synthèse (`purrBuffer`) | **oui, corrigé** : voix propre (`tune.purr`) |
| | phare | synthèse (`purrBuffer`) | **oui, corrigé** : voix propre (`tune.purr`) |
| `outside` | chambre | `audio/bedroom/birds` + `crickets` | non |
| | cabane perchée | `audio/bedroom/birds` + `crickets` | **oui** : mêmes fichiers que la chambre |
| | onsen | `audio/onsen/outside` (filet d'eau, clé `garden`) sous une synthèse d'oiseaux et de grillons | non (la synthèse n'est utilisée que là) |
| `waves` | plage | `audio/beach/waves` | non |
| | phare | synthèse (houle sur la roche : coups sourds, vagues plus grosses) | non, déjà propre ; `tune.waves.level` règle son niveau |
| `pages` | café | `audio/cafe/pages` | non |
| | train | `audio/cafe/pages` | **oui** : même fichier que le café |
| `chimes` | plage | `audio/beach/chimes` | non |
| | onsen | `audio/beach/chimes` | **oui** : même fichier que la plage (la synthèse de repli, elle, est déjà propre : tubes de métal / furin de verre) |

## Ce qui est corrigé

Les **synthèses** partagées ont maintenant une voix par pièce, lue dans `tune` de la fiche (`src/rooms/<pièce>.ts`, lu par `src/audio/tune.ts`). Toujours continues et douces, et sans effet sur les enregistrements (qui jouent d'abord ; la synthèse n'est que le repli).

| Pièce | Son | Réglage `tune` |
|---|---|---|
| plage | `purr` | chat jeune et vif : `pitch` 1,12 (cadence plus rapide), `tone` 900 Hz, `body` 215 Hz, ronrons plus courts et plus rapprochés |
| phare | `purr` | vieux matou : `pitch` 0,88, `tone` 520 Hz, `body` 125 Hz, ronrons plus longs |
| phare | `fire` | poêle de fonte creux : grondement coupé à 300 Hz, peu de craquements |
| phare | `waves` | niveau 0,65 (la synthèse était +5,8 dB au-dessus de la médiane) |
| toit | `fire` | braséro en plein air : grondement léger, plus de flammes et de craquements |
| café | `fire` | cheminée de salon : feu plus doux |
| cabane perchée | `wind` | frissonnement de feuillage : souffle plus aigu, sans sifflement ni grondement |

Le vent de repli du toit (brise) et du phare (tempête) étaient déjà distincts (`wind.ts`).

## À enregistrer

Les fichiers partagés ne sont pas dupliqués (ce serait la même chose sous un autre nom). Chaque ligne attend un enregistrement propre à la pièce ; licence à décider avec le propriétaire (Pixabay n'est accordée que pour les boucles déjà listées et la météo).

| Son | Pièce | Suggestion de recherche |
|---|---|---|
| `wind` | phare | `wind howling stairwell`, `gale lighthouse` : tempête dans un escalier, grave, sans claquement |
| `wind` | cabane perchée | `wind in oak leaves summer`, `leaves rustling breeze` |
| `fire` | toit | `fire barrel crackling outdoor`, `brazier crackling` : feu à l'air libre, léger |
| `purr` | cabane | un autre chat : `cat purring on blanket`, plus grave, de près |
| `outside` | cabane perchée | `forest morning birds` (jour) + `night forest crickets frogs` (nuit) : deux fichiers, `birds` et `crickets` |
| `pages` | train | `page turning train compartment`, `book pages quiet` + roulis lointain |
| `chimes` | onsen | `furin glass wind bell` : clochette de verre, plus aiguë et plus rare que les tubes de la plage |

## Niveaux (audio:levels, 2026-11-16)

`npm run audio:levels` mesure maintenant la sonie **réelle** des fichiers (ffmpeg, au lieu de -20 LUFS supposés) et suit les `loops` réels de `outside` (une ligne « jour » avec les oiseaux, une « nuit » avec les grillons ; le jardin de l'onsen s'ajoute à sa synthèse). Médiane : -27,5 LUFS ; plus aucun canal à plus de 4 dB en dehors de ce qui suit.

Laissés tels quels (réglés à l'oreille par le propriétaire, ou voulus) :

| Canal | Écart | Pourquoi on n'y touche pas |
|---|---|---|
| chambre `outside` | -13,1 dB (jour), -9,2 dB (nuit) | `birds` 0,16 et `crickets` 0,25 réglés à l'oreille |
| cabane perchée `outside` | -15,3 dB (jour), -11,5 dB (nuit) | mêmes fichiers et mêmes gains que la chambre ; à régler à l'écoute avec la chambre |
| cabane `knit` | -6,7 dB | cabane réglée à l'oreille |
| café `street` | -4,3 dB | idem |
| `radio` (toutes pièces) | +11 dB | voulu : la musique passe au-dessus des boucles (gain 2,2, voir `tracks.ts`) |
| `rain` et `noise` | +3,4 à +3,5 dB | calés ensemble (voir `docs/NOISE.md`) : la carte Bruit joue au même niveau que la pluie, sans écraser les sons de pièce ni être couverte par eux |
