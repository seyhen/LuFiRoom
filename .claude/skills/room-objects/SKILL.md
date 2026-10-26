---
name: room-objects
description: Choisir, concevoir et sonoriser les objets interactifs d'une pièce de LufiRoom (nouvelle pièce, ou objet à ajouter). À lancer dès qu'on crée une pièce, qu'on veut « un objet de plus », « un nouveau son », ou que l'utilisateur demande des objets qui donnent envie de toucher et d'écouter pour étudier, lire ou dormir. Garantit un son propre à chaque objet (jamais repris d'une autre pièce), agréable (ASMR, étude, sommeil), cohérent avec l'histoire de la pièce, visible quand il joue, et branché de bout en bout (données, canal audio, enregistrement, niveaux, traductions, préréglages).
---

# Objets interactifs d'une pièce

Un objet interactif de LufiRoom est une promesse : « touche-moi, je fais un son que tu as envie d'entendre pendant une heure ». Il doit donc être **juste** (il appartient à cette pièce), **unique** (son son n'existe nulle part ailleurs), **doux** (on peut travailler ou s'endormir dessus) et **vivant** (on voit qu'il joue).

Règles de la maison : `CLAUDE.md` (« Le soin des ambiances », « Sons », licences). Après construction : skill `audit-room`.

## Étape 1 — Inventaire (5 minutes, obligatoire)

1. Les sons qui existent déjà, toutes pièces confondues : `grep -n "build:" src/audio/engine.ts` (le registre `CHANNELS`) et `SoundId` dans `src/rooms/types.ts`. **Un nouvel objet a un identifiant de son qui n'est pas dans cette liste**, et un son qui ne ressemble pas à un existant (pas de « pluie 2 », pas de « feu 2 », pas d'un second bruit de pages). Une pièce peut reprendre un son *générique* (pluie, chat) seulement si l'utilisateur le demande.
2. Les objets de la pièce (`objects` de `src/rooms/<id>.ts`) et ce que la pièce raconte (le commentaire en tête de sa scène, `src/scene/<id>/<Id>Scene.tsx`).
3. Les zones vides de la pièce (capture de jour, vue d'ensemble) et **la carte des objets interactifs** : relève l'`anchor` de chacun dans `objects` et place-les sur un plan de la pièce en neuf cases (fond / milieu / devant × gauche / centre / droite).

## Étape 1 bis — Où le poser : éparpiller

Les objets interactifs sont **répartis dans toute la pièce**, pas entassés dans un coin. On doit avoir envie de parcourir la pièce du regard pour les trouver.

- **Une case vide d'abord.** Le nouvel objet va dans une des neuf cases qui n'a pas encore d'objet interactif, de préférence au devant ou au milieu (le fond est souvent déjà pris par la fenêtre, la radio, la lampe).
- **Pas de grappe.** Au plus 2 objets interactifs dans la même case, et au moins **1,2** (unités de la scène) entre l'ancre du nouveau et celle de chacun des autres. En dessous, les boutons se chevauchent à l'écran, surtout sur téléphone.
- **Exception seulement si le contexte l'impose.** Deux objets peuvent être proches quand l'histoire le veut vraiment : le fouet à matcha posé sur le même plateau que la théière, l'encrier sur le bureau à côté du journal. Dans ce cas, garde au moins **0,6** entre les ancres, décale-les en hauteur, et écris la raison en une ligne dans la description du composant.
- **Le meuble suit l'objet, pas l'inverse.** Si la seule place cohérente est dans une zone déjà chargée, déplace plutôt l'objet sur un autre meuble ou ajoute un petit meuble (tabouret, guéridon, étagère) dans une case vide.
- **Vérifie à l'écran** : capture jour, desktop et 390 px, avec les points blancs des boutons visibles. Les boutons doivent être répartis sur toute la pièce et ne jamais se toucher.

Toujours : 0,15 au moins entre deux objets posés au sol (CLAUDE.md, « Trop entassé »).

## Étape 2 — Choisir l'objet : la grille

Propose 3 candidats par pièce, puis garde celui qui coche le plus de cases. **Un candidat qui rate une case « bloquante » est écarté.**

| Critère | Bloquant ? | Question |
|---|---|---|
| Cohérent | oui | Quelqu'un vivant dans cette pièce aurait-il cet objet sous la main, ce soir ? (un fouet à matcha dans l'onsen oui, dans le sous-marin non) |
| Son unique | oui | Ce son n'existe dans aucune autre pièce (étape 1) et ne ressemble à aucun |
| Doux | oui | On l'écouterait 1 h en étudiant ou pour s'endormir. Pas d'aigu perçant, pas de bip, pas d'alarme, pas de cri, pas de coup sec répété, pas de grincement, pas de souffle de respiration humaine |
| Geste humain ou nature | — | Les sons préférés de l'ASMR sont des gestes lents : tricoter, fouetter, verser, feuilleter, gratter une plume, moudre, battre des cartes, un bâton de pluie, l'eau qui coule |
| Continu ou régulier | — | Un fond continu (eau, souffle) ou un geste qui revient sans cesse (aiguilles, pinceau) ; pas un évènement unique qu'on attend |
| Visible quand il joue | — | Quelque chose bouge : les aiguilles s'entrecroisent, la vapeur monte, le fouet tourne, le sable coule |
| Reconnaissable de loin | — | Une silhouette qu'on comprend sans l'étiquette (voir « On ne sait pas ce que c'est » dans CLAUDE.md) |
| Trouvable | — | Un enregistrement existe (Pixabay, CC0) ou se synthétise bien (bruits filtrés, gouttes, grains) |

Familles de sons qui marchent pour l'étude et le sommeil : **eau** (filet, versement, gouttes espacées, bulles douces), **papier et bois** (feuilles, plume, pinceau, cartes, boulier, aiguilles de bois), **textiles** (tricot, couture), **souffle** (vapeur douce, sable, bâton de pluie), **cuisine lente** (moudre, fouetter, remuer). À éviter : métal qui claque, électronique, voix, animaux qui crient, moteurs, **et tout ce qui frotte, râcle ou broie** (moulin à café, moulin à poivre, ponceuse, lime, mortier : le grain abrasif fatigue l'oreille au bout de quelques minutes, même quand le geste est humain). Un geste est agréable quand il **glisse, tombe, souffle ou claque doucement** (eau, papier, bois, tissu), pas quand il **gratte**.

**Règles d'ancrage (refus de l'utilisateur sur capture, octobre 2026) :**
- **Rien ne flotte.** Tout objet suspendu a un support visible et plausible : un crochet, une corde, une étagère, un clou. Un parapluie « accroché » à un bras de laiton trop fin se lit comme en l'air : écarté. Si le support est trop petit pour se voir, change d'objet ou de porteur (ici : le manteau déjà accroché au portemanteau, qui goutte).
- **Un souvenir ne se pose pas sur un pied de sol.** Un bâton de pluie, une conque ou un instrument d'ornement s'accroche au mur ou se pose sur un meuble ; un support de bois planté au milieu du tapis fait « jouet ». Le geste (basculer, tourner) se fait autour d'un pivot réel.
- **Les plantes se soignent comme le reste** : pot assez grand pour la plante, tiges qui ondulent (`Vines`, brique partagée), feuilles serrées et de tailles variées ; trois ficelles droites avec trois feuilles se lisent « moches ».

Test d'écoute avant de proposer un objet : imagine le son 20 minutes de suite, en fond, à voix basse. Si une seule seconde du son (un raclement, un grincement, un cliquetis métallique, un souffle humain) te ferait baisser le volume, écarte l'objet. Mieux : fais écouter un extrait à l'utilisateur avant de construire.

## Étape 3 — Concevoir l'objet

1. **Fiche** dans `src/rooms/<id>.ts` :
   - `objects` : `{ id, target, label: 'Objet · ce qu'il fait', anchor }` — l'ancre sur le corps de l'objet, centrée.
   - `sounds` : `{ id, name, chip, volume, sub }` — un nom court, un sous-titre vivant (« les aiguilles s'entrecroisent »), un volume par défaut bas (0,4 à 0,6).
   - `presets` : ajoute le son au préréglage où il a sa place (lire, dormir, travailler).
2. **Types** : le nouvel identifiant dans `SoundId` (et `ObjectId` si l'objet est nouveau), `src/rooms/types.ts`.
3. **Scène** : un fichier par objet dans `src/scene/<id>/`, posé avec `position` à son pied (rebond de clic), `userData={{ id }}` sur le groupe, `useSquash`. Ce qui ne bouge pas en `<Static>` imbriqué ; ce qui bouge quand le son joue lit `isActive(useStore.getState(), '<son>')` dans un `useFrame` (jamais de logique audio dans la scène).
4. **Ce qu'il fait quand il joue** : une animation lente, liée au son (vitesse du geste ≈ rythme du son), qui respecte `reduceMotion`.
5. **Traductions** : libellé, nom et sous-titre dans `src/i18n.ts` (français → anglais).
6. **Icône** de la carte du mixeur : `soundIcons` dans `src/ui/icons.tsx`.

## Étape 4 — Le son

1. **Enregistrement d'abord** (le synthétique sonne faux sur les gestes humains). Sources : CC0, ou Pixabay (exception accordée, voir CLAUDE.md) ; propose 2 ou 3 pistes de recherche à l'utilisateur (mots-clés anglais), il choisit par capture. Note la source dans `public/audio/CREDITS.md`.
2. **Préparer** : 20 à 60 s sans évènement marquant, mono si la source est petite (un objet), dans `audio-src/<pièce>/<son>.wav`, puis `npm run audio` (−20 LUFS, Opus + MP3).
3. **Déclarer** dans `loops` de la pièce : `{ src: 'audio/<pièce>/<son>', gain: 0.8 }`.
4. **Canal** `src/audio/channels/<son>.ts`, enregistré dans `CHANNELS` (`src/audio/engine.ts`), avec la bonne lecture :
   - geste irrégulier ou court qu'on entendrait boucler (aiguilles, pinceau, cartes) → `kit.grainsOr` (segments tirés au hasard) ;
   - fond continu (eau, souffle) → `kit.loopOrChannel` ;
   - évènement espacé (un versement, un tir) → `kit.shotsOr` avec un `gap` de plusieurs secondes.
   Toujours une synthèse de repli dans le dernier argument (un bruit filtré qui évoque le son suffit).
5. **Niveaux** (pont `window.__lofi.audio`, voir `audit-room` étape 1.5) : fond continu −28 à −32 dB RMS, geste ponctuel ≈ −10 dB de crête ; règle `base` dans `CHANNELS`. Écoute ensuite **avec les autres sons de la pièce** : le nouveau ne doit pas les couvrir.

## Étape 5 — Vérifier

- `npx tsc --noEmit -p .`, `npm run build`, console vide.
- Objet en gros plan, jour et nuit (défauts de CLAUDE.md), son allumé : l'animation se voit, le bouton est sur l'objet.
- Le son tourne 5 minutes sans lasser : pas de motif qui revient à l'identique, pas de clic aux raccords.
- Inventaire relancé (étape 1) : l'identifiant est unique.
- Carte relancée (étape 1 bis) : les objets interactifs couvrent la pièce, aucune grappe sans raison écrite, les boutons ne se touchent pas.
- Skill `audit-room` si la pièce est nouvelle ou beaucoup retouchée.

## Idées déjà retenues (à ne pas reprendre ailleurs)

| Pièce | Objet | Son (`id`) |
|---|---|---|
| Chambre | diffuseur d'huiles qui brume | `mist` |
| Cabane | panier de tricot, aiguilles en bois | `knit` |
| Café | manteau mouillé du portemanteau, qui s'égoutte sur le paillasson (un parapluie suspendu à un bras de laiton a été refusé : il flottait) | `drip` |
| Plage | bâton de pluie en bambou, accroché au mur du fond (sur un pied au sol : refusé, « bizarre ») | `rainstick` |
| Train de nuit | jeu de cartes, une réussite | `cards` |
| Toit-terrasse | arrosoir sur les aromates | `watering` |
| Atelier | pinceau sur la toile du chevalet | `brush` |
| Onsen | bol et fouet à matcha | `whisk` |
| Phare | plume d'oie et encrier, le journal de bord | `quill` |
| Sous-marin | grand coquillage qu'on porte à l'oreille | `shell` |
| Marché de nuit | boulier du marchand | `abacus` |
| Igloo | fenêtre de glace sur l'aurore boréale (le ciel qui chante) | `aurora` |
| Igloo | trou de pêche dans la glace (clapotis, bulles) | `icehole` |
| Igloo | moufle qu'on coud sur un billot | `sew` |
| Igloo | thermos de cacao qu'on verse dans un quart émaillé | `cocoa` |

Mets ce tableau à jour à chaque objet ajouté.

## Idées écartées (et pourquoi)

À relire avant de proposer : ne repropose pas ce qui a déjà été refusé.

| Objet | Son | Raison |
|---|---|---|
| Moulin à café manuel (café) | moulure de grains | refusé par l'utilisateur : « pas agréable à écouter » — le grain abrasif qui broie fatigue (règle « frotte, râcle, broie » de l'étape 2) |

Quand l'utilisateur refuse un objet ou un son, ajoute-le ici avec sa raison, et corrige la règle de l'étape 2 si la raison est générale.
