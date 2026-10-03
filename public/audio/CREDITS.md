# Crédits audio

Chaque fichier de `public/audio/` est listé ici avec sa source et sa licence. Pas de ligne, pas de fichier.

**Licences acceptées** : CC0 (domaine public), ou licence achetée qui autorise l'usage commercial.
Tout le reste (CC BY, CC BY-NC, « gratuit pour usage personnel », musique « libre de droits » sans licence écrite…) :
on demande avant de l'utiliser.

Pour chaque fichier, garde aussi la page ou le reçu de la licence (capture ou PDF) hors du dépôt, avec le fichier source d'origine.

## Boucles d'ambiance (chambre)

| Fichier | Contenu | Auteur | Source (lien) | Licence | Retouches | Ajouté le |
|---|---|---|---|---|---|---|
| | | | | | | |

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

Tant qu'un son n'a pas d'enregistrement dans sa pièce (`loops` de `src/rooms/*.ts`), il reste synthétisé en direct dans le navigateur : rien à créditer.
C'est le cas aujourd'hui de tous les sons des huit pièces (vagues, mouettes, carillon, train, thé, ville, pigeons, clavier, crayon, bouilloire, source, shishi-odoshi compris).
