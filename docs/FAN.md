# Le ventilateur de la chambre (3 vitesses) et le chien de la cabane

Deux objets interactifs ajoutés ensemble, avec la même idée : **un réglage qu'on voit et qu'on entend**.

## Le ventilateur (chambre, son `fan`, carte « Bruit blanc »)

- **Trois vitesses** : `low` (Faible), `mid` (Moyen, celle d'avant), `high` (Fort). `src/state/fan.ts` : types, nettoyage (`cleanFan`), règle du toucher (`fanTap`), rotation des pales, stockage.
- **Ce que règle la vitesse**
  - le son (`src/audio/channels/fan.ts`) : niveau (≈ −5 dB, 0, +2 à +3 dB), brillance du souffle (passe-bas et étagère d'aigus), hauteur du ronflement du moteur (74, 110, 148 Hz), battement des pales et part de souffle de la synthèse. Les changements glissent en un quart de seconde environ (un moteur ne change pas de régime d'un coup), enregistrement compris (le filtre et le niveau s'appliquent aussi à la boucle `audio/bedroom/fan`) ;
  - les pales (`src/scene/bedroom/Fan.tsx`) : 9, 22 ou 38 rad/s ; la tête balaie au rythme des pales ; la touche de la vitesse choisie est enfoncée, le témoin ambre s'allume, deux rubans noués à la grille s'envolent d'autant plus que le vent est fort ; les rideaux et la guirlande de lunes bougent plus ou moins (`FAN_WIND`) ;
  - `prefers-reduced-motion` : les pales tournent doucement (3, 5 ou 8 rad/s), la tête reste fixe, les rubans pendent sans battre.
- **L'interface** (le sous-titre de la carte dit la vitesse : « brise douce », « souffle régulier », « plein vent ») : trois pastilles « Faible / Moyen / Fort » (`aria-pressed`, 44 px, style `.nz-chip`) sous le volume de la carte (`src/ui/FanControls.tsx`). Choisir une vitesse allume le ventilateur, comme choisir une couleur de bruit.
- **La règle du toucher sur l'objet** (hotspot et 3D : `touch` du store) : éteint, un toucher l'allume à sa vitesse ; **allumé, chaque toucher passe à la vitesse suivante sans l'éteindre** ; après « Fort » il s'éteint, et **repart de « Faible »** au toucher d'après (sans cela, il se rallumerait sur « Fort » et il faudrait deux touchers de plus pour l'éteindre). Un tour complet : éteint → faible → moyen → fort → éteint. La carte du mixeur, elle, ne fait qu'allumer et éteindre : elle garde la vitesse.
- **Mémoire** : `localStorage` `chambre-lofi.fan` (une chaîne : `"low"`, `"mid"` ou `"high"`). Une valeur abîmée donne « Moyen ».
- **Ambiances** (`docs/MIXES.md`) : `Mix.fan` est **facultatif**, enregistré seulement si le son `fan` joue ; lien `&fan=low|mid|high`. Un lien ou une ambiance sans lui reste valide : le ventilateur garde sa vitesse. Une valeur inconnue est ignorée.
- **Tests** : `tests/fan.test.mjs` (nettoyage, cycle du toucher, stockage, lien, ambiances).

## Le chien de la cabane (son `snore`, carte « Chien », objet `dog`)

- **L'objet** (`src/scene/cabin/Dog.tsx`) : un golden au poil de miel, couché sur le ventre sur le tapis tressé (à gauche du fauteuil), le menton sur les pattes, les yeux fermés, un collier canneberge et sa plaque, la queue enroulée, sa balle rouge contre son museau. D'une seule peau (`blob.ts`, yeux et plaque fusionnés dans le même maillage : 2 tracés avec l'ombre).
- **Le souffle partagé** (`src/state/snore.ts`) : la courbe du flanc (`breath`) et le rythme (4,5 s, l'expiration plus longue). Le canal (`src/audio/channels/snore.ts`) programme chaque souffle (durée et profondeur légèrement différentes d'un souffle à l'autre) et appelle `pulse` au début de chacun ; la scène additionne sa phase image après image et se recale en douceur sur `pulses.snore` (`toBreathStart`). Sans le son, il respire plus lentement (5,8 s) et moins fort. Avec `prefers-reduced-motion` : respiration plus petite, pas de « z » qui montent.
- **Le son** (provisoire : synthétisé, en attendant un enregistrement) : une respiration lente et grave, bruit brun et rose filtré dans un passe-bande qui s'ouvre à l'inspiration, et sous l'expiration un ronflement très doux (dent de scie vers 45 à 65 Hz filtrée sous 420 Hz). Rien d'aigu, aucune voix, aucun grincement. Il ne ressemble pas au `husky` de l'igloo (souffle rose à 0,2 Hz sans ronflement) ni au `purr` du chat.
- Niveau : `base` 1,2, calé à −31 LUFS (médiane des canaux de la chambre et de la cabane : −30,7).
