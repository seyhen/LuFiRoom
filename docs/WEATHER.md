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
- **Ce qu'on voit** : rien ne tombe dans la pièce (elles ont des murs et des toits). La pluie et la neige tombent dans le ciel du fond (`src/ui/WeatherSky.tsx`, un canvas 2D sous la scène 3D, arrêté quand il fait beau), sous un voile gris ou blanc. La lumière baisse (`mood.rain`, `mood.snow`, `mood.storm` dans `Lights.tsx`) et ce qu'on voit dehors suit la météo (ci-dessous). Sous la mer (`skyLife: false`), rien dans le fond.
- **L'orage** : un éclair toutes les 2 min 30 à 5 min, jamais dans les deux dernières minutes du minuteur de sommeil, et le tonnerre dans le bus de la météo (il suit son volume). Au phare, la tempête porte aussi l'orage ; si la météo est déjà à l'orage, un seul tonnerre gronde.
- **Les ambiances et les liens** gardent la météo (`weather` dans `Mix`, `&weather=snow` dans le lien). Un ancien lien qui allume `rain` se lit comme la pluie.
- `prefers-reduced-motion` : pas d'éclair, et une image fixe de la pluie ou de la neige.

## Ce qu'on voit dehors, pièce par pièce

Trois valeurs de `mood` (avancées par `Lights.tsx`, 0 → 1 en un peu plus d'une seconde) : `rain` (mouillé, la bruine à 0,55), `snow` (enneigé : neige 0,7, tempête de neige 1) et `storm` (l'orage, ou le son `storm` de la pièce : la tempête du phare).
Les vues peintes les reçoivent (`usePainted`, `useRepaint` dans `src/scene/paint.ts`) et ne se redessinent que pendant une transition, puis une fois posées. Les outils communs :

- le ciel : gris de pluie, ardoise d'orage (`skyWx`), blanc laiteux sous la neige ; soleil, lune et étoiles voilés (`clearOf`) ;
- la neige posée : un bourrelet blanc sur les arêtes (`snowLine` : toits, collines, rochers, appuis de fenêtre), des surfaces blanchies (`snowFill`) ; la tempête de neige efface le lointain dans un voile blanc (`paintWhiteout`) et sème des flocons immobiles (`paintFlakes`) ;
- derrière la vitre, des flocons qui tombent (`ViewFlakes`, un tracé, aucun sans neige), et l'éclair qui éclaire la vue (`FlashVeil`, un tracé seulement pendant la lueur) ;
- les bandes qui défilent (`ScrollLayer`) : teinte d'orage et houle qui forcit (`storm`, `swell`), teinte de neige ou bande jumelle enneigée (`snow`, `snowMap`) ;
- les volumes du dehors (tours du toit, montagnes et lisière de l'onsen) : `snowTop` blanchit leur matériau là où il regarde le ciel (`src/scene/snowTop.ts`), sans tracé en plus.

| Pièce | Pluie, bruine | Orage | Neige, tempête de neige |
|---|---|---|---|
| Chambre | ciel voilé, lune et soleil cachés | ciel d'ardoise, éclair | ciel laiteux, collines blanches au bas de la fenêtre, flocons ; la tempête efface les collines. La tache de lumière au sol devient blanche et pâle |
| Cabane (toujours sous la neige) | ciel bas de neige fondue ; les flocons deviennent de la neige fondue, plus fine et plus rapide (dans la vue et autour de la cabane) ; la neige des collines grisonne | ciel d'ardoise, éclair | ciel laiteux ; tempête : flocons poussés de côté, collines et sapins effacés |
| Café | comme avant (Édimbourg, *dreich*) | ciel plus noir, éclair | toits, pignons à redents, remparts, rocher, appuis de fenêtre et chaussée blanchis, arbres poudrés, reflets éteints, vitre sèche, flocons ; tempête : le Château disparaît |
| Plage | ciel gris, soleil et rais de lumière éteints, mer grise, sable mouillé | ciel d'ardoise, nuages bas, mer vert-de-gris couverte de moutons, houle qui forcit, le voilier rentré, lumière de la porte grise, éclair | ciel blanc, cap et sable blanchis, mer grise et froide, flocons ; tempête : l'horizon s'efface |
| Train de nuit | ciel gris, montagnes voilées | ciel et paysage assombris, éclair | montagnes blanches jusqu'au pied, prés, bosquets, toits et talus enneigés (bandes jumelles), flocons qui filent de côté ; tempête : le lointain s'efface |
| Toit-terrasse | lune cachée | tours du fond plus sombres, lune cachée | toits, corniches et gradins des tours blanchis ; tempête : tours du fond effacées dans le blanc |
| Atelier | voile de pluie (comme avant), tour Eiffel moins scintillante | ciel d'ardoise, éclair | zinc, chiens-assis, souches, mitrons et dôme blanchis, flocons ; tempête : la tour Eiffel s'efface |
| Onsen | lune cachée | montagnes plus sombres, lune cachée | montagnes blanchies sur leurs pentes et leurs cimes, lisière poudrée sur le dessus ; tempête : la brume blanche s'épaissit entre les rangs |
| Phare | la trouée d'ambre se ferme, nuages plus gris | nuages noirs, mer grise couverte de moutons, houle qui forcit, le cargo reste au port, éclair (aussi quand la tempête du baromètre souffle) | ciel blanc, rochers enneigés, mer grise, flocons ; tempête : l'horizon s'efface |
| Sous-marin | la lumière de surface et les rais pâlissent (un ciel couvert, loin au-dessus) | plus terne encore ; aucun éclair sous la mer (ni dans la pièce) | la lumière de surface pâlit ; ni neige ni ciel |
| Igloo | pas de vitre : la pluie tombe dans le ciel du fond, l'aurore se cache derrière les nuages | ciel du fond plus sombre, éclair, aurore cachée | flocons dans le ciel du fond, aurore cachée |
| Marché de nuit | pluie peinte et vitre qui ruisselle (comme avant) | ciel plus sombre, éclair | toits des immeubles blanchis, chaussée blanche aux reflets éteints, deux ornières du tram, flocons ; tempête : la ville du fond s'efface |

Les oiseaux et l'avion qui passent derrière la plage et le toit (`FlyBy`) ne volent plus par mauvais temps.

Ce que ça coûte (tracés par image, toutes passes, nuit, 390 px, mesuré le 2026-10-25) : rien par beau temps ni sous la pluie (mêmes chiffres qu'avant) ; la neige ajoute un tracé (les flocons derrière la vitre), quatre au train (ses trois bandes enneigées) ; un éclair, un tracé le temps de sa lueur. Les vues peintes ne se redessinent qu'au changement de météo.

## Niveaux mesurés (2026-10-25, bus de la carte au volume par défaut, en dB)

| Pièce | Pluie | Orage | Neige | Tempête de neige | Bruine |
|---|---|---|---|---|---|
| Chambre (vitre fermée) | -28,8 | -25,8 | -36,4 | -28,9 | -35,4 |
| Cabane | -27,5 | -25,7 | -35,8 | -28,9 | -34,7 |

La neige est voulue plus basse : c'est presque un silence. Mesurés avant le réglage du plein air (5 dB plus bas) et de la neige (3 dB plus haut).

## Reste à faire

- De vrais enregistrements : bruine, averse, orage (pluie et tonnerre séparés), neige feutrée, tempête de neige. Pixabay (accord du 2026-10-24) ou Freesound CC0 ; liens de recherche dans l'historique, skill `source-sounds`.
- Plus tard : brouillard, vent seul, grêle.
