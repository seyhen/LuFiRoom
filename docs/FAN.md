# Le ventilateur de la chambre et le chien de la cabane

Deux objets interactifs de la chambre et de la cabane : **un geste qu'on voit et qu'on entend**.

## Le ventilateur (chambre, son `fan`, carte « Bruit blanc »)

- **Une seule vitesse** (la « moyenne » d'avant). Il a eu trois vitesses (faible, moyen, fort) du 2026-11-24 au 2026-11-27 : les trois pastilles sous le volume de la carte agrandissaient trop le mixeur en bas de l'écran, et le propriétaire n'en voulait pas (« pas besoin d'avoir l'intensité »). Ne pas les remettre ; si une intensité revient un jour, un simple curseur dans la carte, pas des pastilles.
- **Le son** (`src/audio/channels/fan.ts`) : souffle brun et rose modulé au rythme des pales (7,2 Hz), plus le ronflement du moteur (110 Hz) ; ou l'enregistrement `audio/bedroom/fan` en segments tirés au hasard.
- **L'objet** (`src/scene/bedroom/Fan.tsx`) : les pales tournent à 22 rad/s (5 avec `prefers-reduced-motion`, la tête fixe, les rubans qui pendent), la tête balaie, les deux rubans noués à la grille s'envolent, le témoin ambre s'allume, la touche du milieu du socle est enfoncée (les trois touches sont du décor) ; les rideaux et la guirlande de lunes bougent à peine quand il tourne.
- **Le toucher** : un toucher sur l'objet ou sur sa carte allume et éteint, comme tout autre son (`touch` du store ne fait plus que `toggle`).
- **Ambiances et liens** : plus de champ `fan` dans `Mix` ni de `&fan=` dans le lien ; un ancien lien ou une ancienne ambiance qui en porte un reste valide (le champ est ignoré). L'ancienne clé `localStorage` `chambre-lofi.fan` est abandonnée, sans effet.

## Le chien de la cabane (son `snore`, carte « Chien », objet `dog`)

- **L'objet** (`src/scene/cabin/Dog.tsx`) : un golden au poil de miel, couché sur le ventre sur le tapis tressé (à gauche du fauteuil), le menton sur les pattes, les yeux fermés, un collier canneberge et sa plaque, la queue enroulée, sa balle rouge contre son museau. D'une seule peau (`blob.ts`, yeux et plaque fusionnés dans le même maillage : 2 tracés avec l'ombre).
- **Le souffle partagé** (`src/state/snore.ts`) : la courbe du flanc (`breath`) et le rythme (4,5 s, l'expiration plus longue). Le canal (`src/audio/channels/snore.ts`) programme chaque souffle (durée et profondeur légèrement différentes d'un souffle à l'autre) et appelle `pulse` au début de chacun ; la scène additionne sa phase image après image et se recale en douceur sur `pulses.snore` (`toBreathStart`). Sans le son, il respire plus lentement (5,8 s) et moins fort. Avec `prefers-reduced-motion` : respiration plus petite, pas de « z » qui montent.
- **Le son** (provisoire : synthétisé, en attendant un enregistrement) : une respiration lente et grave, bruit brun et rose filtré dans un passe-bande qui s'ouvre à l'inspiration, et sous l'expiration un ronflement très doux (dent de scie vers 45 à 65 Hz filtrée sous 420 Hz). Rien d'aigu, aucune voix, aucun grincement. Il ne ressemble pas au `husky` de l'igloo (souffle rose à 0,2 Hz sans ronflement) ni au `purr` du chat.
- Niveau : `base` 1,2, calé à −31 LUFS (médiane des canaux de la chambre et de la cabane : −30,7).
