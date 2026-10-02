# Radio : les stations

Sans piste enregistrée (`playlist` vide dans la pièce), la radio joue de la musique générative : un petit groupe
(batterie, accords, basse, mélodie) joué en direct par `src/audio/channels/radio.ts`. Chaque **station** le règle
autrement ; elles sont décrites dans `src/audio/stations.ts`. Tout est calculé dans le navigateur : aucun fichier, aucune licence.

| Station | Tempo | Accords | Couleur |
|---|---|---|---|
| Nuit douce | 72 | Cmaj9 - Am9 - Dm9 - G13 | piano électrique, clochette : la radio du prototype, inchangée |
| Petit matin | 82 | Bbmaj9 - Am9 - Gm9 - Fmaj9 | guitare pincée, shaker, cross-stick, boîte à musique |
| Brume | 66 | Am9 - Fmaj9 - Cmaj9 - G13 | piano voilé, shaker doux, beaucoup de vinyle et d'écho |
| Veillée | 62 | Dm9 - Bbmaj9 - Fmaj9 - C6/9 | nappes, balais, boîte à musique |
| Bureau | 86 | Dm9 - G13 - Cmaj9 - Am9 | piano électrique, batterie sèche, peu de mélodie |

## Changer de station

- Le bouton ⏭ à côté du volume de la carte « Radio lofi » passe à la station suivante, en boucle. Le nom de la station
  est le sous-titre de la carte.
- Écran verrouillé, notification et touches multimédia : suivant et précédent, tant que la radio joue (Media Session).
- Radio allumée, on « tourne le bouton » : le son se coupe, le grésillement de recherche passe (0,3 s), la nouvelle station
  repart sur le premier temps. Radio éteinte, la station est seulement choisie.
- La station est retenue par le navigateur. Elle est enregistrée avec une ambiance, et ajoutée au lien de partage
  (`&station=veillee`), quand la radio fait partie de l'ambiance.
- Si une pièce a des pistes enregistrées (`playlist`), la radio les joue dans un ordre mélangé et le bouton disparaît.

## Ajouter ou modifier une station

1. Dans `src/audio/stations.ts`, ajoute un objet à `STATIONS` (le plus simple : partir d'une station proche).
   Nom de 12 caractères au plus, identifiant en minuscules et tirets (il apparaît dans les liens : ne le change plus ensuite).
2. `npm run stations` vérifie la musique, puisqu'on ne peut pas l'écouter dans un script : notes du piano dans l'accord,
   notes de mélodie qui ne sonnent pas faux, basse sur la fondamentale, voix qui bougent de 4 demi-tons au plus d'un accord
   au suivant, rythmes dans la mesure, et que la première station reste la radio du prototype.
3. Écoute, puis règle `level` pour qu'elle sonne aussi fort que les autres : changer de station ne doit pas faire sauter le
   volume. Mesure du 2026-10-02 (sortie de l'app, 12 s par station) : toutes entre -11 et -13 dBFS RMS, puis Brume et
   Petit matin baissées d'environ 1 dB.

Ce qui peut varier d'une station à l'autre : tempo et swing ; accords (quatre notes de piano, basse, notes de mélodie) ;
voix des accords (`ep` piano électrique, `pad` nappe, `pluck` corde pincée) et leurs coups dans la mesure ; ligne de basse ;
batterie (kick, `snare` / `rim` / `brush`, charley `closed` ou `shaker`) ; mélodie (`bell` clochette ou `mbox` boîte à
musique, et les mesures où elle joue) ; couleur du bus (passe-bas, saturation, vinyle, désaccord de cassette, écho).
