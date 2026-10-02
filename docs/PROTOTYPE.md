# Notes techniques du prototype

Référence : `docs/prototype.html` (Three.js r128, Web Audio, un seul fichier).
Toutes les valeurs ci-dessous viennent de ce fichier. Unités 3D : 1 unité ≈ 1 m à l'échelle de la pièce.

## Scène

### Caméra et cadrage
- `OrthographicCamera`, direction `(1, 0.8, 1)` normalisée, vise `(0, 1.85, 0)`, à 40 unités.
- Cadrage : la pièce tient dans la zone libre entre le titre (en haut) et le mixeur (en bas).
  `unit = min(largeur / 10.4, hauteurDispo / 9.6)` pixels par unité, puis la vue est décalée verticalement pour centrer la pièce dans cette zone. Recalculé au resize et quand le mixeur change de taille.
- Glisser horizontalement fait tourner la pièce sur Y, limité à ±0.6 rad, lissé (`lerp` avec facteur `dt * 6`).
- La pièce flotte : `y = sin(t * 0.7) * 0.06` (désactivé si `prefers-reduced-motion`).

### Lumières
| | Jour | Nuit |
|---|---|---|
| Hémisphérique (ciel / sol) | `#fff4fb` / `#bca8d0`, 0.62 | `#6c6db8` / `#2c2448`, 0.42 |
| Directionnelle (soleil / lune) | `#fff0e2`, 0.6 | `#9fb2ff`, 0.28 |
| Lampe champignon (PointLight `#ffb070`, distance 9, decay 1.5) | 0 | 1.8 |

- Soleil en `(5, 10, 7)`, ombres PCFSoft 2048, frustum ±8, `bias -0.0004`, `normalBias 0.03`.
- La pluie baisse l'hémisphérique de 12 % et le soleil de 30 %.
- Transition jour/nuit sur environ 0.9 s, courbe smoothstep.
- Mode nuit par défaut entre 20 h et 7 h (heure locale).

### Matériaux « gummy »
- `MeshPhysicalMaterial` : `roughness 0.46`, `metalness 0`, `clearcoat 0.55`, `clearcoatRoughness 0.3`.
- Murs plus mats : `roughness 0.78`, `clearcoat 0.12`.
- Toutes les boîtes ont des arêtes arrondies (fonction maison `rbox` → à remplacer par `RoundedBox` de drei).

Palette des objets :
| Nom | Hex | Usage |
|---|---|---|
| wallBack | `#eae1f1` | mur du fond |
| wallLeft | `#f3e8e1` | mur gauche (sous la fresque) |
| base | `#c5b3dc` | socle de la pièce |
| toffee | `#c77f5e` | lit, cadre |
| toffeeLight | `#e2b08b` | table de chevet |
| cream | `#fff7ef` | matelas, pieds de lampe |
| teal | `#37a3b5` | couette |
| tealLight | `#9edbe0` | revers de couette |
| pink | `#f3afc6` | chaise, livres |
| mint / mintDark | `#8fd8c6` / `#58b3a3` | radio |
| butter | `#f6d071` | ventilateur |
| plum | `#4a3a5a` | métal sombre, cadres de fenêtre |
| peri | `#abb6ef` | tapis |
| woodLight / woodLeg | `#ecc9a0` / `#d8ad85` | bureau, étagère |
| terracotta | `#ee9d86` | pot de plante |
| leaf / leaf2 | `#67bb7c` / `#8ed59b` | feuilles |
| fur / furDark / furLight | `#b7b4ca` / `#8a879f` / `#e6e3ee` | chat |
| cloud (sec / pluie) | `#fdfbff` / `#b9b6cf` | nuage |

Textures générées en canvas : parquet en bâtons, fresque murale (arcs pastel), poster, ciel vu par la fenêtre (dégradé, soleil ou lune, étoiles, collines ; redessiné seulement quand le jour/nuit ou la pluie changent).

### Pièce
- Sol 6.54 × 6.54 centré en `(-0.07, -0.12, -0.07)`, socle 6.86 × 0.55 dessous.
- Murs hauts de 4.35. Mur du fond à `z = -3.26`, percé d'une fenêtre (x 0.2 → 2.6, y 2.1 → 3.85). Mur gauche à `x = -3.17`, avec la fresque.
- Ombre douce sous le diorama (sprite radial) pour l'effet « flotte ».

### Objets interactifs
| Objet | Position | Ce qu'il pilote | Retour visuel |
|---|---|---|---|
| Radio | `(1.9, 1.35, -2.55)` sur le bureau | radio lofi | notes qui s'envolent à chaque kick, cadran éclairé, antenne qui bouge, la radio pulse sur le kick |
| Nuage | `(1.3, 4.95, -3.85)` dehors, au-dessus de la fenêtre | pluie | le nuage fonce, 150 gouttes instanciées (6.5 à 8.5 u/s) tombent derrière la vitre |
| Ventilo | `(0.98, 1.35, -2.45)` | bruit blanc | pales à 22 rad/s, la tête oscille |
| Chat | `(-1.15, 0.88, -0.55)` sur le lit | ronron | respiration plus ample (période 2.7 s), queue qui balance, cœurs toutes les 1.3 s |
| Fenêtre | mur du fond | sons du dehors | deux battants s'ouvrent vers l'intérieur (1.08 rad) |
| Lampe | `(-2.55, 0.68, -2.55)` table de chevet | jour / nuit | halo, guirlande lumineuse sur le mur gauche |

Toujours animé : vapeur du mug sur le bureau, clignotement doux de la guirlande la nuit.

### Interactions
- Tap (déplacement < 8 px) sur un objet = bascule. Détection par raycast sur les meshes de l'objet.
- Squash au tap : `s = sin(a * 17) * exp(-a * 5.5)` sur 1.4 s ; Y × (1 − 0.16 s), XZ × (1 + 0.1 s).
- Survol souris : objet +4 %, curseur main.
- Hotspots : bouton DOM placé chaque frame sur l'ancre 3D projetée de l'objet. Anneau qui pulse pour inviter à toucher, retiré après 3 taps. Point plein couleur accent quand l'objet est actif.

## Interface
- En haut : titre « Chambre Lofi », une phrase d'aide, l'heure (HH:MM, masquée sur mobile), bouton jour/nuit.
- En bas : mixeur flottant (verre dépoli). Une carte par son : pastille icône colorée, nom, sous-titre vivant, curseur de volume. Compteur « n sons actifs » et bouton « Tout couper ».
  - Sous-titres : Radio → accord en cours + « 72 bpm » ; Pluie → « vitre ouverte / fermée » ; Bruit blanc → « ventilateur » ; Ronron → « chat endormi » ; Dehors → « oiseaux » le jour, « grillons » la nuit.
- Mode nuit : classe `night` sur `<html>`, qui redéfinit les tokens d'interface.

Tokens d'interface :
| Token | Jour | Nuit |
|---|---|---|
| `--bg` | `#e5daef` | `#191632` |
| `--ink` | `#33264a` | `#f3eeff` |
| `--ink-soft` | `#6b5b85` | `#b8addb` |
| `--panel` | `rgba(255,251,255,.76)` | `rgba(30,25,58,.78)` |
| `--line` | `rgba(80,60,120,.15)` | `rgba(210,190,255,.15)` |
| `--accent` | `#128d96` | `#6cd9d2` |
| Pastilles | radio `#9fdecd`, pluie `#b9d4f7`, ventilo `#f8dc8c`, chat `#dcd2f2`, dehors `#f7c4d4` | idem |

Polices : Gluten 600/800 (titre), Nunito 500/700/800 (texte), DM Mono 400/500 (données). Le ciel de fond est un dégradé radial, avec des étoiles la nuit.

## Audio

### Graphe
```
canal (bus Gain) ─┐
canal (bus Gain) ─┼─> master Gain 0.9 ─> DynamicsCompressor ─> destination
...               ─┘   (threshold -16, knee 12, ratio 3.5, attack 8 ms, release 300 ms)
```
- `AudioContext` créé au premier geste utilisateur. Le graphe d'un canal n'est construit qu'à sa première activation.
- On/off par `setTargetAtTime` : constante 0.45 s à l'allumage, 0.28 s à l'extinction. Volume : constante 0.06 s.
- Gain final d'un canal = volume utilisateur × gain de base.

| Canal | Gain de base | Volume par défaut |
|---|---|---|
| radio | 0.9 | 0.75 |
| rain | 1.0 | 0.70 |
| fan | 0.75 | 0.55 |
| cat | 0.95 | 0.70 |
| window (dehors) | 1.0 | 0.65 |

### Buffers de bruit
- Blanc 5 s, rose 6 s (filtre de Paul Kellet), brun 7 s, en stéréo.
- Boucle sans couture : on génère N + F échantillons et on fond la queue dans la tête (fondu à puissance constante, F = 0.25 s). Normalisés à 0.8 de crête.
- Chaque couche démarre à un offset différent pour éviter les effets de phase.

### Canaux
- **Pluie** : rose → passe-haut 450 → ×0.5 → passe-bas ; gouttes (buffer 8 s, 60 gouttes/s, pings sinus 1.4 à 5.4 kHz, décroissance 1.5 à 6 ms) → passe-haut 900 → ×0.55 → passe-bas ; brun → passe-bas 220 → ×0.45 (grondement, hors passe-bas). Passe-bas à 2300 Hz fenêtre fermée, 7500 Hz ouverte (transition 0.4 s).
- **Ventilo** : brun → passe-bas 950 ×0.7, plus rose → passe-bande 1900 ×0.18, modulés en amplitude par un sinus 7.2 Hz (profondeur 0.07). Ronflement moteur : sinus 110 Hz ×0.016.
- **Ronron** : buffer de 5.4 s (2 cycles de 2.7 s : inspiration sur 40 % à 27 Hz, pause, expiration sur 46 % à 23.5 Hz), bruit filtré × pulsation³ × enveloppe → passe-bas 650 → peaking 170 Hz +5 dB.
- **Dehors** : fond d'air (rose → passe-bas 650 ×0.16) et événements → passe-haut 1100 → sec ×0.75 et réverb (convolution, impulsion 2.2 s) ×0.4.
  - Jour : phrases d'oiseaux toutes les 1.4 à 4.2 s, 3 types (montées, trille descendant, appel à deux notes), panoramique aléatoire.
  - Nuit : 3 grillons (4.3, 4.75, 5.2 kHz), stridulations de 3 ou 4 impulsions toutes les 0.5 à 0.85 s.
- **Sons d'interface** : « pop » (sinus 520 → 900 Hz à l'allumage, 420 → 230 Hz à l'extinction, 140 ms, gain 0.1).

### Radio lofi générative
- 72 bpm, grille en doubles croches, swing de 28 % sur les doubles croches impaires.
- Ordonnanceur à anticipation : `setInterval` 25 ms, horizon 140 ms (1.6 s quand l'onglet est caché).
- Grille d'accords, une mesure chacun (notes MIDI) :
  | Accord | Basse | Voicing | Notes de mélodie |
  |---|---|---|---|
  | Cmaj9 | 36 | 52 55 59 62 | 67 71 72 74 76 79 |
  | Am9 | 33 | 55 59 60 64 | 67 69 71 72 76 79 |
  | Dm9 | 38 | 53 57 60 64 | 69 72 74 76 77 81 |
  | G13 | 31 | 53 57 59 64 | 67 71 74 76 77 79 |
- Batterie : kick pas 0 et 10 (+ kick fantôme pas 7, une mesure sur deux en moyenne) ; caisse claire pas 4 et 12 (12 ms en retard) ; charley sur les pas pairs, quelques notes fantômes.
- Piano électrique : sinus + triangle désaccordé + attaque à 4× la fréquence. Accord au pas 0 (9 pas), puis les 3 notes hautes au pas 10. Arpège de 18 ms entre les notes.
- Basse : triangle + sinus, passe-bas 520. Pas 0, 7 (octave), 10, 14 (note d'approche un demi-ton sous la prochaine fondamentale).
- Mélodie : clochette (sinus + 3e harmonique) seulement sur les mesures 4 à 7 d'un cycle de 8, rythme tiré parmi 5 motifs, marche aléatoire dans les notes de l'accord. Delay de 3 doubles croches, retour 0.3, passe-bas 1800.
- Effet cassette : LFO de désaccord 0.33 Hz (±9 cents) et 5.5 Hz (±2.5 cents) sur piano et clochette.
- Sidechain : chaque kick baisse piano et basse à 0.55, retour en 0.16 s.
- Bus radio : passe-bas 3200 → saturation douce `tanh(1.6x)`. Crépitement de vinyle en boucle (7 s, passe-haut 250, ×0.3).
- Au démarrage : grésillement de recherche de station (bruit en passe-bande qui glisse de 700 à 2600 Hz en 0.5 s).

## Limites connues
- Les sons synthétisés sont agréables mais restent synthétiques : la phase 2 les remplace par des enregistrements.
- iOS : le Web Audio se coupe quand l'écran se verrouille ou que l'app passe en arrière-plan. La lecture en fond demandera sans doute un `HTMLAudioElement` et la Media Session API. À étudier en phase 4.
- Ombres en temps réel (shadow map 2048) : pour la prod, précalculer la lumière dans les textures (phase 2).
- Performances jamais mesurées sur un vrai téléphone.
