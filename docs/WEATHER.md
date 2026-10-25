# Météo

La météo remplace le nuage d'autrefois. On la choisit dans le sélecteur de la barre du haut, dans toutes les pièces ; elle change le son, la lumière et le ciel du fond.

Décisions du propriétaire (2026-10-24) : le nuage disparaît au profit du sélecteur ; toutes les météos sont possibles dans toutes les pièces.

## Les météos

| Id | Nom | Son | Dehors |
|---|---|---|---|
| `clear` | Dégagé | rien (c'est la carte « Météo » éteinte) | le ciel de la pièce, étoile filante et oiseau |
| `drizzle` | Bruine | la pluie à moitié, sans ses graves | voile gris léger, pluie fine, vitres un peu mouillées (`mood.rain` à 0,55) |
| `rain` | Pluie | la pluie | voile gris, pluie, vitres mouillées, lumière baissée |
| `storm` | Orage | la pluie plus forte, un peu de vent, le tonnerre | voile plus sombre, pluie oblique, éclairs rares (voir `Lights.tsx`) |
| `snow` | Neige | un vent froid très étouffé : le monde se tait | voile blanc, flocons qui descendent en se balançant |
| `blizzard` | Tempête de neige | le vent froid en rafales, ouvert | flocons poussés de côté |

## Comment c'est fait

- **Le modèle** (`src/state/weather.ts`) : la météo choisie est `weather` dans le store (retenue dans le navigateur, la pluie par défaut). Elle joue sur le son `rain` de chaque pièce : la carte « Météo » du mixeur. Carte allumée, on a la météo choisie ; éteinte, un ciel dégagé (`skyOf`). « Dégagé » dans le sélecteur éteint la carte ; une autre météo l'allume.
- **Le son** (`src/audio/channels/rain.ts`) : deux couches qui se croisent en fondu (environ 1 s) quand la météo change. La pluie (l'enregistrement de la pièce, ou celui du café par défaut, en grains) et le vent froid (celui de la cabane), chargé seulement à la première météo qui le demande. Chacune a sa synthèse de repli. Le mélange de chaque météo est dans `MIX`.
- **D'où on l'entend** (`shelter` de la pièce) : derrière une vitre (`glass`, par défaut : étouffée, plus claire quand l'objet `window` est ouvert), en plein air (`open` : plage, toit, onsen, marché ; plus bas pour ne pas couvrir la pièce), ou de très loin à travers la coque (`deep` : sous-marin). Le sous-titre de la carte le dit : « Neige · contre les rondins ».
- **Ce qu'on voit** : rien ne tombe dans la pièce (elles ont des murs et des toits). La pluie et la neige tombent dans le ciel du fond (`src/ui/WeatherSky.tsx`, un canvas 2D sous la scène 3D, arrêté quand il fait beau), sous un voile gris ou blanc. La lumière baisse (`mood.rain`, `mood.snow` dans `Lights.tsx`) et les vues peintes se mouillent comme avant. Sous la mer (`skyLife: false`), rien dans le fond.
- **L'orage** : un éclair toutes les 2 min 30 à 5 min, jamais dans les deux dernières minutes du minuteur de sommeil, et le tonnerre dans le bus de la météo (il suit son volume). Au phare, la tempête porte aussi l'orage ; si la météo est déjà à l'orage, un seul tonnerre gronde.
- **Les ambiances et les liens** gardent la météo (`weather` dans `Mix`, `&weather=snow` dans le lien). Un ancien lien qui allume `rain` se lit comme la pluie.
- `prefers-reduced-motion` : pas d'éclair, et une image fixe de la pluie ou de la neige.

## Niveaux mesurés (2026-10-25, bus de la carte au volume par défaut, en dB)

| Pièce | Pluie | Orage | Neige | Tempête de neige | Bruine |
|---|---|---|---|---|---|
| Chambre (vitre fermée) | -28,8 | -25,8 | -36,4 | -28,9 | -35,4 |
| Cabane | -27,5 | -25,7 | -35,8 | -28,9 | -34,7 |

La neige est voulue plus basse : c'est presque un silence. Mesurés avant le réglage du plein air (5 dB plus bas) et de la neige (3 dB plus haut).

## Reste à faire

- De vrais enregistrements : bruine, averse, orage (pluie et tonnerre séparés), neige feutrée, tempête de neige. Pixabay (accord du 2026-10-24) ou Freesound CC0 ; liens de recherche dans l'historique, skill `source-sounds`.
- Les vues peintes ne connaissent pas encore la neige (pas de toits blancs derrière les vitres) ; la mer de la plage reste ensoleillée sous l'orage.
- Plus tard : brouillard, vent seul, grêle.
