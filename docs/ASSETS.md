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
3. Déclare-le dans la pièce concernée (`src/rooms/bedroom.ts` : champs `loops` et `playlist` ; le script affiche la ligne `src:` à copier).
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
| `fire` | feu de bois (cabane) | feu de cheminée qui crépite, de près | 0.8 |
| `wind` | vent (cabane) | vent sur la neige, avec des rafales | 0.8 |
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

## Bruits colorés

`npm run noises` calcule cinq bruits (blanc, rose, brun, bleu, violet : 20 s, stéréo, deux canaux indépendants) dans `audio-src/noise/`, puis `npm run audio` les encode dans `public/audio/noise/`.
Pas de ffmpeg pour les générer (seulement pour l'encodage), des graines fixes : les fichiers sont les mêmes à chaque exécution. Pentes vérifiées sur les fichiers encodés : 0, -3, -5.7, +3 et +5.9 dB par octave (WebM) ; niveau constant à ±0.5 dB.
Ils sont en repo mais **pas branchés** : aucune pièce ne les déclare, donc l'app ne les télécharge pas. Pour en utiliser un, par exemple comme enregistrement de `fan` :
`loops: { fan: { src: 'audio/noise/brown', gain: 0.6 } }` (le brun est le plus proche du ventilo ; à régler à l'oreille).

## Où trouver les sons

Je n'ai pas pu parcourir ces sites depuis l'environnement où je travaille (réseau fermé) : rien de ci-dessous n'est vérifié, **c'est à toi de contrôler la licence de chaque fichier avant de l'ajouter**.

**Règle** : CC0 ou licence achetée qui autorise l'usage commercial. Écarte « CC BY » (il faudrait créditer dans l'app : à décider avant), tout « NC » (non commercial), « ND », et les mentions vagues (« libre de droits », « gratuit pour usage personnel ») qui ne disent pas ce qu'on peut faire.
Plusieurs banques de sons « gratuites » ont une licence propre qui exclut la revente du fichier seul ou limite l'usage commercial : lis-la, ne te fie pas au mot « gratuit ».

Pistes de recherche (à vérifier) :
- catalogues collaboratifs de sons, avec un filtre de licence « CC0 » (Freesound, OpenGameArt, Wikimedia Commons) ;
- bibliothèques de sons vendues à l'unité ou en pack, avec une licence commerciale écrite (à garder avec le reçu) ;
- pour la musique : un·e artiste lofi qui te vend une licence pour l'app (la plus sûre, et ça donne une identité), des labels qui proposent des licences commerciales, ou des morceaux CC0.
  Attention aux morceaux « sans droit d'auteur » dont on ne retrouve pas la licence écrite.

Quoi chercher (mots-clés anglais, en général plus riches) :

| Son | Recherche | À éviter dans la prise |
|---|---|---|
| `rain` | `rain on window`, `rain window interior`, `light rain loop` | tonnerre, voitures, voix |
| `fan` | `desk fan`, `table fan loop`, `fan hum` | clics de commutateur, claquements |
| `purr` | `cat purring`, `purr close` | miaulements, bruits de pièce |
| `birds` | `birdsong morning`, `forest birds ambience` | un seul oiseau très marqué qui reviendrait à chaque boucle |
| `crickets` | `crickets night`, `night insects ambience` | voix, avions |
| `fire` | `fireplace crackling`, `wood fire close` | pops très forts isolés |
| `wind` | `wind blizzard`, `wind snow ambience`, `howling wind` | tonnerre, voix, objets qui claquent |

Pour chaque fichier retenu, ajoute **tout de suite** sa ligne dans `public/audio/CREDITS.md` (auteur, lien, licence, date) et garde une capture de la page de licence hors du dépôt.
Puis : `audio-src/`, `npm run audio`, déclaration dans la pièce, écoute au casque et sur le haut-parleur d'un téléphone, réglage du `gain`.

## Générer les sons avec une IA

Une autre voie que les banques de sons : générer les boucles et la musique avec un outil d'IA. Je ne peux pas appeler ces services depuis mon environnement : c'est toi qui génères, moi qui intègre (`audio-src/`, `npm run audio`, déclaration, mixage, `CREDITS.md`).
Mes connaissances sur ces outils s'arrêtent à mi-2026 et leurs conditions changent vite : **relis les conditions d'usage au moment où tu t'abonnes**.

**Ce qui doit être vrai, pour rester dans la règle « CC0 ou licence achetée »** :
- l'offre que tu utilises autorise explicitement l'**usage commercial** des sons générés, et leur **redistribution dans une app** (pas seulement « publier sur les réseaux ») ;
- tu es sur le **plan payant concerné au moment de la génération** (les conditions s'appliquent souvent à la date de création : un son généré en offre gratuite peut rester non commercial) ;
- tu gardes une trace : l'outil, le plan, la date, le prompt, une capture des conditions. Écris-les dans `public/audio/CREDITS.md` (colonne « Source » : « généré avec X, plan Y, date »).
- Le statut juridique de la musique générée est encore mouvant selon les pays (droit d'auteur sur les sorties d'IA, litiges autour des données d'entraînement de certains services). Ça ne bloque pas l'usage dans l'app, mais ça veut dire qu'on ne peut pas toujours empêcher qu'un tiers réutilise ces sons.
- Écarte les modèles ouverts dont les poids sont publiés pour la **recherche ou le non commercial** (c'est le cas de certains modèles de musique ouverts très connus).

**Choisir selon le besoin** :

| Besoin | Piste | Pourquoi |
|---|---|---|
| Bruit blanc, rose, brun | Pas d'IA : `ffmpeg` (`anoisesrc`) ou la synthèse de l'app | un bruit blanc n'a pas de « prise de son » : il est déjà parfait en synthèse |
| Ambiances (pluie, ventilo, feu, vent, oiseaux, grillons, ronron) | Un générateur d'effets sonores sur plan payant commercial, ou des enregistrements CC0 | l'IA est bonne pour des textures continues, moins pour le ronron d'un chat |
| Musique lofi | Un générateur de musique dont l'offre autorise l'usage dans un produit, ou un·e artiste lofi sous licence | c'est la partie la plus exposée juridiquement : pour une app qu'on veut vendre, une licence écrite d'un·e artiste est la plus sûre |

**Prompts de départ** (en anglais, les générateurs y répondent mieux) :

- `rain` : *gentle steady rain on a window, heard from inside a quiet room, soft, continuous, no thunder, no voices, no cars*
- `fan` : *small desk fan running at low speed, steady soft hum and air flow, close microphone, continuous, no clicks*
- `purr` : *a cat purring softly and steadily, close recording, continuous, no meowing, no room noise*
- `birds` : *quiet morning birdsong in a garden, several species, gentle, a little distant, continuous, no human sounds*
- `crickets` : *crickets chirping at night in a quiet countryside, continuous, no other sounds*
- `fire` : *wood fire crackling in a fireplace, steady warm crackle, close microphone, continuous, no voices*
- `wind` : *cold wind over snow, steady with slow gusts and a soft low howl, continuous, no thunder, nothing rattling*
- radio : *lofi hip hop, instrumental, 72 bpm, warm electric piano chords, soft dusty drums with a lazy swing, mellow bass, light vinyl crackle, relaxed, no vocals, steady loudness, 3 minutes* (variantes : *rainy afternoon*, *late night study*, *cozy winter cabin*, entre 70 et 85 bpm)

**Après la génération** : écoute en entier et garde 20 à 60 s sans évènement marquant (pour les boucles) ; pour la musique, vérifie qu'il n'y a ni voix, ni changement brusque, ni fin abrupte. Note le **tempo** de chaque morceau (champ `bpm` de `playlist`).
Les boucles n'ont pas besoin d'être parfaitement bouclables : l'app fond chaque passage dans le suivant.

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

**Objets interactifs : des nœuds séparés, nommés comme les `ObjectId` de `src/rooms/types.ts`**

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
