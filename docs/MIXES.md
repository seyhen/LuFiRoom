# Ambiances enregistrées et partage par lien

Une **ambiance** (type `Mix`, `src/state/mixes.ts`) : la pièce, les sons qui jouent avec leur volume, et le jour / nuit ; en plus, la station si la radio joue, la météo si la carte « Météo » joue, et `noise: { color, tilt }` si la carte « Bruit » joue (voir `docs/NOISE.md`).

## Dans l'app

Le bouton « Ambiances » (cœur) de l'en-tête du mixeur ouvre un menu :
- **Enregistrer celle-ci** : garde l'ambiance en cours dans le navigateur (`localStorage`, 12 au plus, la plus récente en tête ; la même ambiance enregistrée deux fois ne fait qu'une entrée). Elle porte le nom de ses sons.
- **Partager** : copie un lien (ou ouvre la feuille de partage du téléphone quand elle existe).
- La liste : toucher une ambiance la rejoue (la pièce change si besoin, les volumes et le jour / nuit se règlent, les sons s'allument) ; la croix la supprime.

Désactivés tant qu'aucun son ne joue. Les ambiances restent sur l'appareil : pas de compte, rien n'est envoyé à un serveur.

## Le lien

```
https://exemple.fr/?room=cabin&mix=fire.80,wind.40&night=1
```

`room` : identifiant de la pièce ; `mix` : `son.volume` en pourcentage de curseur, séparés par des virgules ; `v=2` : la courbe des volumes (voir plus bas ; un lien sans `v` est un ancien lien) ; `night` : `1` pour la nuit, `0` pour le jour ; `noise` (`white`, `pink`, `brown`, `green`) et `tilt` (−100 à 100) règlent la carte « Bruit » si elle est dans `mix` (`&noise=brown&tilt=-30`). Un lien sans eux, ou une ambiance enregistrée avant la carte, reste valide : le réglage de l'appareil ne change pas.
Ouvert, le lien n'allume **rien** tout seul (le navigateur interdit l'audio avant un geste, et ce serait mal poli) : une carte au-dessus du mixeur propose « Écouter » ou « Non merci », puis l'adresse est nettoyée.

Un lien est ignoré, sans erreur, si sa pièce est inconnue ou si aucun de ses sons n'existe dans cette pièce ; les sons inconnus sont écartés, les volumes ramenés entre 0 et 100.

## Courbe des volumes

Le volume général suit l'oreille (au carré) ; les curseurs des cartes font de même depuis la version 2 des ambiances : le moteur joue un son à `vol² × base`
(`userLevel` dans `src/audio/engine.ts`). Le `vol` du store est donc une **position de curseur** (0 à 1), et c'est elle que les ambiances et les liens gardent.
Avant, le curseur était directement l'amplitude : à 50 %, un son jouait à 0,5 de son niveau ; maintenant, à 0,25. Pour que rien ne change à l'oreille :
- **Les fiches des pièces** (`volume` de `rooms/*.ts`) restent l'amplitude d'origine (le niveau voulu, `volume × base`) : le store les convertit au démarrage en position,
  `√volume` (`sliderOf` dans `state/mixes.ts`). Une fiche n'est donc pas à retoucher, et un nouveau son se règle comme avant ; seule la position du curseur change (0,49 devient 0,7).
- **Les ambiances** portent `v: 2` (`MIX_VERSION`). Celles sans `v` (enregistrées dans le navigateur avant la courbe, « Reprendre » compris) sont converties à la lecture : `√volume`, arrondi au centième.
  Le même niveau sonore, un curseur plus haut.
- **Les liens** : ceux qui portent `v=2` donnent des positions de curseur ; les anciens (sans `v`) donnent des amplitudes et sont convertis de la même façon. `mixToUrl` écrit toujours `v=2`.

Le curseur du volume général, lui, était déjà au carré : il n'a pas changé.

## Pour le code

- Le store garde `mixes`, `shared` et les actions `currentMix`, `saveMix`, `deleteMix`, `applyMix`, `dismissShared`.
- `applyMix` d'une autre pièce passe par `goto` (la transition coupe tout), puis allume les sons une fois la pièce affichée. Comme ce n'est plus le geste du clic à ce moment-là,
  l'interface appelle d'abord `unlockAudio()` (`src/audio/engine.ts`), qui crée ou relance l'`AudioContext` pendant le geste.
- Ajouter un son ou une pièce ne demande rien ici : les ambiances sont lues dans les données des pièces.
