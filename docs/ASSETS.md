# Assets : sons et modèle 3D

Phase 2 du plan. Le code qui sait charger de vrais sons est en place ; il attend les fichiers.
Tant qu'un son n'a pas d'enregistrement, il reste synthétisé comme en phase 1 : on peut remplacer les sons un par un.

## Sons : de la source au navigateur

```
audio-src/bedroom/rain.wav   ──  npm run audio  ──>  public/audio/bedroom/rain.webm  (Opus)
                                                      public/audio/bedroom/rain.mp3   (repli Safari ancien)
```

1. Mets le fichier source (WAV, FLAC, MP3, OGG, M4A…) dans `audio-src/<dossier>/`. Ce dossier n'est pas dans git (sources lourdes).
2. `npm run audio` encode tout ce qui est nouveau ou modifié (`npm run audio -- --force` pour tout refaire).
   Il faut **ffmpeg** dans le PATH : sous Windows, `winget install Gyan.FFmpeg`, puis rouvrir PowerShell.
   Chaque fichier sort en Opus/WebM (64 kbit/s en mono, 96 en stéréo) et en MP3 (repli), à la même sonie : **-20 LUFS**.
3. Déclare-le dans `src/rooms/bedroom.ts` (le script affiche la ligne `src:` à copier).
4. Écris la source et la licence dans `public/audio/CREDITS.md`. **Licences : CC0 ou achetée, rien d'autre sans en parler.**

Le navigateur prend le WebM s'il le lit, sinon le MP3. Si un fichier manque ou ne se décode pas, le son retombe sur la synthèse
(un avertissement s'affiche dans la console) : la chambre ne reste jamais muette.

### Boucles d'ambiance

À déclarer dans `loops` de `src/rooms/bedroom.ts`, sous la forme `{ src: 'audio/bedroom/rain', gain: 1 }`.

| Clé | Remplace | Pour quoi | Départ conseillé pour `gain` |
|---|---|---|---|
| `rain` | pluie | pluie sur une vitre, vue de l'intérieur. Passe dans un filtre : étouffée fenêtre fermée, nette fenêtre ouverte. | 1 à 1.4 |
| `fan` | bruit blanc | ventilateur de bureau, souffle régulier | 0.6 |
| `purr` | ronron | chat qui ronronne, de près | 0.1 à 0.3 |
| `birds` + `crickets` | dehors | oiseaux le jour, grillons la nuit (**les deux ensemble**, sinon le dehors reste synthétisé). Le passage de l'un à l'autre suit le bouton jour / nuit. | 0.3 à 0.5 |

Les gains sont des points de départ, mesurés avec des bruits de test : règle-les à l'oreille, en gardant le mélange
comparable à la synthèse (compare en coupant l'enregistrement dans `bedroom.ts`).

Ce qu'il faut dans le fichier :
- **20 à 60 secondes**, pas besoin qu'il boucle parfaitement : chaque passage se fond dans le suivant sur 2 s (fondu à puissance constante).
  Évite en revanche un évènement marquant (un coup de tonnerre, un aboiement) : on l'entendrait revenir à chaque tour.
- Mono pour une source ponctuelle (ventilo, ronron, grillons), stéréo pour une ambiance large (pluie, oiseaux).
- Pas de silence au début ni à la fin, pas de musique, pas de voix. Le niveau est ramené à -20 LUFS : inutile de normaliser avant.
- Gardable en mémoire : une boucle décodée pèse ~380 ko par seconde en stéréo 48 kHz (190 en mono), soit 23 Mo pour une minute de pluie stéréo. Reste sous une minute.

### Radio : pistes lofi

À déclarer dans `playlist` de `src/rooms/bedroom.ts` :

```ts
{ src: 'audio/radio/nuit-douce', title: 'Nuit douce', artist: 'Nom', bpm: 72 }
```

- Les pistes sont jouées **dans un ordre mélangé**, sans jamais répéter deux fois la même d'affilée, et lues en flux (pas décodées en mémoire).
- `bpm` fait pulser la radio dans la scène (une note qui s'envole tous les deux temps). `beat` (secondes) cale le premier temps si la piste
  ne démarre pas pile dessus. Pour mesurer le tempo : un battement manuel dans un logiciel audio, ou l'outil « tap tempo » de ton choix.
- Le titre et l'artiste s'affichent sous « Radio lofi » dans le mixeur.
- Sans aucune piste, la radio joue sa musique générative (phase 1). Si aucune piste ne se charge, elle y retombe aussi.
- Durée libre. Prévois plusieurs pistes : 5 à 10 minutes de musique au total pour ne pas tourner en rond.
- Les fichiers doivent être servis depuis **le même domaine** que l'app (sinon le serveur doit envoyer les en-têtes CORS).

### Poids

Un budget raisonnable pour le premier chargement : **moins de 2 Mo** de boucles (elles sont préchargées pendant l'écran de chargement).
Les pistes de la radio ne sont téléchargées qu'à l'écoute et ne comptent pas dans ce budget.

## Écran de chargement

Il est dans `index.html` (HTML et CSS seuls, visibles avant même le JavaScript) et pilotés par `src/ui/splash.ts`.
Il se ferme quand les trois conditions sont remplies : boucles préchargées, scène dessinée une première fois, polices chargées
(avec un délai maximum : 2.5 s pour les polices, 12 s en tout). Il compte chaque fichier de `loops` ; les ajouter à la config suffit.

## Modèle 3D (Blender, .glb) : proposition à valider avant de modéliser

Pas encore fait, et le chargement du `.glb` n'est pas écrit : il dépend du modèle. Voici ce que je propose pour que les deux
se rencontrent du premier coup.

**Export**
- glTF 2.0 binaire (`.glb`), axe Y vers le haut, 1 unité = 1 m, même échelle et mêmes repères que la scène actuelle (sol de ~6.5 × 6.5, mur du fond à `z = -3.26`, mur gauche à `x = -3.17`).
- Compression : `npx @gltf-transform/cli optimize chambre.glb public/models/bedroom.glb --compress meshopt --texture-compress webp --texture-size 2048`.
- Budget mobile milieu de gamme : moins de 100 000 triangles, textures de 2048 px au plus, quelques matériaux, moins de 2 Mo compressé.

**Objets interactifs : des nœuds séparés, nommés comme les `ObjectId` de `src/rooms/bedroom.ts`**

| Nœud | Contient, pour les animations (nœuds enfants nommés) |
|---|---|
| `radio` | `radio_needle` (aiguille), `radio_antenna` |
| `cloud` | le nuage seul, derrière la fenêtre (teinte et tremblement dans le code) |
| `window` | `window_left`, `window_right` (battants, pivot sur la charnière) |
| `fan` | `fan_head` (tête qui oscille), `fan_blades` (pales, pivot au centre) |
| `cat` | `cat_body` (respiration), `cat_tail` |
| `lamp` | `lamp_cap` (abat-jour, matériau émissif) |

Le reste du décor (murs, lit, bureau…) est libre : il n'a pas besoin de nom. Les nœuds ci-dessus servent au tap (raycast), au
rebond, au survol et aux animations. Leur ancre de hotspot reste dans `bedroom.ts`.

**Lumière précalculée**
- Jour : lumière cuite dans les textures (lightmap ou couleur de base).
- Nuit : à décider avec le modèle. Soit une seconde lightmap fondue avec la première, soit le jour cuit plus la lampe en lumière dynamique.
  Le fondu jour / nuit actuel dure ~0.9 s ; la pluie assombrit un peu la pièce.
- Les ombres temps réel (shadow map 2048) disparaissent : c'est le gain de performance attendu de cette phase.
