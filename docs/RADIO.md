# Radio : les stations

Sans piste enregistrée (`playlist` vide dans la pièce), la radio joue de la musique générative : un petit groupe
(batterie, accords, basse, mélodie) joué en direct par `src/audio/channels/radio.ts`. Chaque **station** le règle
autrement ; elles sont décrites dans `src/audio/stations.ts`. Tout est calculé dans le navigateur : aucun fichier, aucune licence.

| Station | Tempo | Accords | Couleur |
|---|---|---|---|
| Nuit douce | 72 | Cmaj9 - Am9 - Dm9 - G13 | piano électrique, clochette : la radio du prototype, inchangée |
| Petit matin | 82 | Bbmaj9 - Am9 - Gm9 - Fmaj9 | guitare pincée, shaker, cross-stick, boîte à musique |
| Brume | 66 | Am9 - Fmaj9 - Cmaj9 - G13 | piano voilé, shaker doux, beaucoup d'écho |
| Veillée | 62 | Dm9 - Bbmaj9 - Fmaj9 - C6/9 | nappes, balais, boîte à musique |
| Bureau | 86 | Dm9 - G13 - Cmaj9 - Am9 | piano électrique, batterie sèche, peu de mélodie |
| Noël | 70 | Gmaj9 - Em9 - Cmaj9 - D13 | piano électrique, boîte à musique, grelots de traîneau |
| Soleil bas | 78 | Ebmaj9 - Cm9 - Abmaj9 - Bb13 | piano électrique chaud, shaker, cross-stick, clochette |
| Minuit | 60 | Cm9 - Abmaj9 - Ebmaj9 - Bb13 | nappes lentes, balais, une seule note de basse par mesure |
| Rosée | 74 | Dmaj9 - Bm9 - Gmaj9 - A13 | guitare pincée, shaker, clochette |
| Pluie fine | 68 | Fmaj9 - Am9 - Dm9 - G13 | piano électrique tendre, boîte à musique, shaker léger |

Il n'y a plus de crépitement de vinyle : il grésillait (octobre 2026), il a été retiré de toutes les stations.

## Changer de station

- Le bouton ⏭ à côté du volume de la carte « Radio lofi » passe à la station suivante, en boucle. Le nom de la station
  est le sous-titre de la carte.
- Écran verrouillé, notification et touches multimédia : suivant et précédent, tant que la radio joue (Media Session).
- Radio allumée, on « tourne le bouton » : le son se coupe, le grésillement de recherche passe (0,3 s), la nouvelle station
  repart sur le premier temps. Radio éteinte, la station est seulement choisie.
- Chaque pièce a ses stations (`stations` dans sa fiche, `src/rooms/`) : la chambre joue les cinq d'origine ; la cabane, sur son **tourne-disque**, joue
  Noël, Veillée, Brume et Nuit douce (le bouton s'y appelle « Disque suivant »). Une station n'est proposée que dans les pièces qui la listent.
- La station est retenue par le navigateur, pièce par pièce. Elle est enregistrée avec une ambiance, et ajoutée au lien de partage
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
   Petit matin baissées d'environ 1 dB. Noël (2026-10-03, 10 s) : -13.1 avant réglage, `level` 1.1 pour l'aligner (les autres : -11.8 à -12.9).
4. Pour l'ajouter à une pièce : son identifiant dans `stations` de la pièce (`src/rooms/<nom>.ts`).

Ce qui peut varier d'une station à l'autre : tempo et swing ; accords (quatre notes de piano, basse, notes de mélodie) ;
voix des accords (`ep` piano électrique, `pad` nappe, `pluck` corde pincée) et leurs coups dans la mesure ; ligne de basse ;
batterie (kick, `snare` / `rim` / `brush`, charley `closed`, `shaker` ou `sleigh`, les grelots de traîneau) ; mélodie (`bell` clochette ou `mbox` boîte à
musique, et les mesures où elle joue) ; couleur du bus (passe-bas, saturation, vinyle, désaccord de cassette, écho).
