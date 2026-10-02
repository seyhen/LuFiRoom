# Ambiances enregistrées et partage par lien

Une **ambiance** (type `Mix`, `src/state/mixes.ts`) : la pièce, les sons qui jouent avec leur volume, et le jour / nuit.

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

`room` : identifiant de la pièce ; `mix` : `son.volume` en pourcentage, séparés par des virgules ; `night` : `1` pour la nuit, `0` pour le jour.
Ouvert, le lien n'allume **rien** tout seul (le navigateur interdit l'audio avant un geste, et ce serait mal poli) : une carte au-dessus du mixeur propose « Écouter » ou « Non merci », puis l'adresse est nettoyée.

Un lien est ignoré, sans erreur, si sa pièce est inconnue ou si aucun de ses sons n'existe dans cette pièce ; les sons inconnus sont écartés, les volumes ramenés entre 0 et 100.

## Pour le code

- Le store garde `mixes`, `shared` et les actions `currentMix`, `saveMix`, `deleteMix`, `applyMix`, `dismissShared`.
- `applyMix` d'une autre pièce passe par `goto` (la transition coupe tout), puis allume les sons une fois la pièce affichée. Comme ce n'est plus le geste du clic à ce moment-là,
  l'interface appelle d'abord `unlockAudio()` (`src/audio/engine.ts`), qui crée ou relance l'`AudioContext` pendant le geste.
- Ajouter un son ou une pièce ne demande rien ici : les ambiances sont lues dans les données des pièces.
