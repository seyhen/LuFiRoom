# Crédits audio

Chaque fichier de `public/audio/` est listé ici avec sa source et sa licence. Pas de ligne, pas de fichier.

**Licences acceptées** : CC0 (domaine public), ou licence achetée qui autorise l'usage commercial.
Tout le reste (CC BY, CC BY-NC, « gratuit pour usage personnel », musique « libre de droits » sans licence écrite…) :
on demande avant de l'utiliser.

Pour chaque fichier, garde aussi la page ou le reçu de la licence (capture ou PDF) hors du dépôt, avec le fichier source d'origine.

## Boucles d'ambiance (chambre et cabane)

Toutes viennent de Pixabay, sous la **Pixabay Content License** (<https://pixabay.com/service/license-summary/>) : usage commercial et modification autorisés, pas de mention obligatoire, **pas du CC0**.
Interdit : revendre ou redistribuer le fichier tel quel (« standalone »), et récupérer du contenu par script ou robot. Chaque fichier ci-dessous est coupé, remixé en mono ou stéréo, normalisé à -20 LUFS, encodé (Opus et MP3) et joué dans une scène interactive, mêlé à d'autres sons.
Accord donné par le propriétaire du projet le 2026-10-02 (la règle « CC0 ou achetée » du projet a été écartée pour Pixabay). Fichiers téléchargés à la main dans le navigateur, un par un. Pour les sons dont l'auteur d'origine est indiqué « (Freesound) », Pixabay est l'intermédiaire (compte `freesound_community`).
Sources d'origine et copie du texte de licence, hors dépôt : `Téléchargements/pixabay-sources/`.

| Fichier | Contenu | Auteur | Source (lien) | Licence | Retouches | Ajouté le |
|---|---|---|---|---|---|---|
| `bedroom/rain` | pluie sur une vitre, « Gentle Rain on Window » | Eryliaa | <https://pixabay.com/sound-effects/nature-gentle-rain-on-window-350529/> (publié le 2025-05-28) | Pixabay Content License | 30 s à partir de 51,5 s, mono | 2026-10-02 |
| `bedroom/fan` | ventilateur de bureau, « Desk Fan » | Db1187 (Freesound), via freesound_community | <https://pixabay.com/sound-effects/household-desk-fan-66784/> (publié le 2023-06-06) | Pixabay Content License | entier (22 s), mono | 2026-10-02 |
| `bedroom/purr` | chat qui ronronne, « Purring Cat » (chambre et cabane) | Universfield | <https://pixabay.com/sound-effects/nature-purring-cat-156459/> (publié le 2023-07-03) | Pixabay Content License | entier (6,9 s), mono | 2026-10-02 |
| `bedroom/birds` | oiseaux le matin, « Morning birdsong » | Krikas | <https://pixabay.com/sound-effects/nature-morning-birdsong-125418/> (publié le 2022-11-10) | Pixabay Content License | 38 s à partir de 22 s, mono | 2026-10-02 |
| `bedroom/crickets` | grillons la nuit, « Night cricket ambience » | Abinash87 (Freesound), via freesound_community | <https://pixabay.com/sound-effects/nature-night-cricket-ambience-22484/> (publié le 2023-07-25) | Pixabay Content License | 30 s à partir de 5 s, mono | 2026-10-02 |
| `cabin/fire` | feu de cheminée, « Fireplace Fire Crackling - Loop » | SoundsForYou | <https://pixabay.com/sound-effects/nature-fireplace-fire-crackling-loop-123930/> (publié le 2022-10-25) | Pixabay Content License | 30 s à partir de 150 s, mono | 2026-10-02 |
| `cabin/wind` | vent froid, « Smooth Cold Wind - Looped » | Shut_Up_Ghost | <https://pixabay.com/sound-effects/nature-smooth-cold-wind-looped-135538/> (publié le 2023-01-18) | Pixabay Content License | 40 s à partir de 125 s, stéréo | 2026-10-02 |

## Bruits colorés (calculés, pas enregistrés)

Générés par `scripts/make-noises.mjs` (`npm run noises`, puis `npm run audio`) : aucune source extérieure, aucune licence à respecter, les fichiers appartiennent au projet.
Pas encore déclarés dans une pièce (voir `docs/ASSETS.md`).

| Fichier | Contenu | Pente | Durée |
|---|---|---|---|
| `noise/white` | bruit blanc | 0 dB / octave | 20 s, stéréo |
| `noise/pink` | bruit rose | -3 dB / octave | 20 s, stéréo |
| `noise/brown` | bruit brun | -6 dB / octave | 20 s, stéréo |
| `noise/blue` | bruit bleu | +3 dB / octave | 20 s, stéréo |
| `noise/violet` | bruit violet | +6 dB / octave | 20 s, stéréo |

## Radio lofi

| Fichier | Titre | Artiste | Source (lien) | Licence | Tempo (bpm) | Ajouté le |
|---|---|---|---|---|---|---|
| | | | | | | |

## Sons d'interface

Les « pops » d'allumage et d'extinction sont synthétisés dans le navigateur (`src/audio/engine.ts`) : aucun fichier.

## Sons synthétisés

Tant qu'un son n'a pas d'enregistrement dans `loops` de sa pièce (`src/rooms/`), il reste synthétisé en direct (moteur de la phase 1) : rien à créditer. C'est le cas de la radio, tant qu'aucune piste n'est déclarée : ses cinq stations sont calculées en direct (`src/audio/stations.ts`).
