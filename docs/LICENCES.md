# Licences audio : état avant publication sur les stores

Revue du 2026-11-16 de `public/audio/` (87 fichiers : 54 enregistrements hors radio, 5 bruits calculés, 28 morceaux de radio).
Source des faits : `public/audio/CREDITS.md`. **Rien ici n'a été vérifié en ligne** (pas de réseau) : ce qui n'est pas dans CREDITS.md est marqué « à vérifier ». Ce document n'est pas un avis juridique ; les textes de licence sont à relire sur les pages officielles au moment de la publication.

Contrôle automatique : `node .claude/skills/release-check/check-credits.cjs` (échoue sur un fichier sans ligne, une ligne sans fichier, une licence vide ou hors liste blanche, une source vide ; avertit pour « à confirmer », « freesound_community » et Pixabay).

## Résumé

| Groupe | Fichiers | Statut | Action |
|---|---|---|---|
| Bruits calculés (`noise/*`) | 5 | **Sûr** : générés par `scripts/make-noises.mjs`, aucune source extérieure | rien |
| Pops d'interface et stations génératives de la radio | aucun fichier | **Sûr** : synthétisés dans le navigateur | rien |
| Pixabay, auteur propre à Pixabay (voir plus bas) | 26 | **Exception accordée** (Pixabay Content License) ; risque « standalone » à mesurer | garder les preuves ; décider de la stratégie (§ c) |
| Pixabay, compte `freesound_community` ou « (Freesound) » | 28 | **À confirmer** : licence d'origine inconnue | retrouver l'id Freesound, vérifier CC0, sinon remplacer (§ b) |
| Radio (28 morceaux, 124 Mo) | 28 | **À confirmer** : « licence à confirmer par le propriétaire » | justificatifs, sinon retirer (§ d) |

Les nombres sont ceux du script (liste des 54 : 26 + 28) ; recompte-les avec lui après toute modification.

## a) Ce que déclare CREDITS.md

- Toutes les boucles enregistrées sont déclarées **Pixabay Content License** (<https://pixabay.com/service/license-summary/>), exception accordée par le propriétaire (2026-10-02, étendue le 2026-10-17, 2026-10-24 et 2026-11-07). Ce n'est **pas** du CC0 : la règle de CLAUDE.md (« CC0 ou achetée ») n'est pas respectée à la lettre, c'est une dérogation.
- Les fichiers ont été téléchargés à la main dans le navigateur du propriétaire (certains « via l'extension Claude à sa demande expresse », c'est écrit dans CREDITS.md). Les sources d'origine et une copie du texte de licence sont censées être dans `Téléchargements/pixabay-sources/` : **à vérifier qu'elles y sont toujours** et à copier ailleurs (sauvegarde).
- Les bruits colorés (`noise/*`) : calculés, appartiennent au projet. La note de CREDITS.md « pas encore déclarés dans une pièce » est peut-être périmée (`docs/NOISE.md` : à vérifier) ; elle n'a pas été retouchée.

### Pixabay, auteurs propres à Pixabay (26 fichiers)

`bedroom/rain` (Eryliaa), `bedroom/purr` (Universfield), `bedroom/birds` (Krikas), `cabin/fire` (SoundsForYou), `cabin/wind` (Shut_Up_Ghost), `cafe/pages` (sarthakraj_308), `cafe/street` (Aman4u), `cafe/rain` + `atelier/rain` + `train/rain` (Liecio), `cafe/fire` (SoundReality, réutilisé par le toit), `atelier/keys` (DRAGON-STUDIO), `beach/waves` (RMultimediaEU), `beach/gulls` (u_up4clmd95a), `beach/chimes` (SoundsForYou, aussi onsen), `roof/city` (CliffordJohnson), `roof/wind` (SoundReality, aussi phare et cabane perchée), `submarine/sonar` (VoiceBosch), `submarine/bubbles` (Liecio), `submarine/hull` (DominiqueLACAUD), `submarine/whale` (Saturn-3-Music), `market/tram` (SSPsurvival), `market/simmer` (Irhouen), `market/neon` (Vadim_Makes_Sound), `market/abacus` (DOBCommunications), `cafe/drip` (DRAGON-STUDIO).
Statut : **sûr sous réserve de la clause « standalone »** (§ c) et d'avoir gardé la preuve du téléchargement.

## b) Sons « freesound_community » relayés par Pixabay (28 fichiers) : risque à traiter

Pixabay publie sous le compte `freesound_community` des sons qui viennent de Freesound. Une fois sur Pixabay, le fichier est servi sous la Pixabay Content License ; mais **la licence d'origine du fichier Freesound (CC0, CC BY, CC BY-NC…) n'est pas vérifiable depuis la page Pixabay** (ce que Pixabay vérifie ou non avant de republier : à vérifier). Si l'original était CC BY, une attribution serait due ; s'il était CC BY-NC, l'usage commercial serait interdit. Dans le doute, c'est le risque le plus sérieux de la liste pour une appli payante.

Fichiers concernés :
`bedroom/fan` (Db1187), `bedroom/crickets` (Abinash87), `bedroom/mist`, `cafe/murmur`, `cafe/espresso`, `atelier/pencil`, `atelier/kettle`, `atelier/brush`, `train/rails`, `train/tea`, `train/cards`, `roof/pigeons`, `roof/watering`, `lighthouse/fire`, `lighthouse/foghorn`, `lighthouse/quill`, `onsen/spring`, `onsen/outside`, `onsen/whisk`, `submarine/engine`, `submarine/shell`, `market/sizzle`, `cabin/knit`, `beach/rainstick`, `laundromat/wash`, `laundromat/tumble`, `treehouse/brook`, `treehouse/cicadas`.
(Seuls deux ont l'auteur Freesound d'origine noté dans CREDITS.md ; pour les autres, il faut le retrouver.)

Procédure proposée, fichier par fichier :
1. Ouvrir la page Pixabay (id dans CREDITS.md), repérer le titre et la durée, chercher le même son sur Freesound (`freesound.org/search/?q=<titre>`), retrouver l'**id Freesound** et l'auteur. Noter l'id dans CREDITS.md (colonne ou mention).
2. Lire la licence affichée sur la page Freesound. **CC0** : OK, le noter, garder une capture. **CC BY** : demander au propriétaire (attribution à prévoir dans l'appli) ou remplacer. **CC BY-NC / autre** : remplacer.
3. Si l'original est introuvable : traiter comme « à remplacer » par un CC0 vérifié (Freesound avec le filtre `license:"Creative Commons 0"`), ou par un autre son Pixabay d'un auteur propre à Pixabay.
Priorité de remplacement si le temps manque : sons qui portent le plus l'ambiance (`bedroom/fan`, `cafe/murmur`, `train/rails`, `lighthouse/fire`, `onsen/spring`, `treehouse/brook`) puis les petits bruitages.

## c) Clause Pixabay « standalone » et robots

Le résumé de licence Pixabay (à relire sur la page officielle, je ne cite pas le texte) interdit, d'après la mention déjà notée dans CREDITS.md, de **revendre ou redistribuer le fichier tel quel** (« standalone ») et de **récupérer du contenu par script ou robot**.

Risque pour LufiRoom : les fichiers sont servis dans `public/audio/` (téléchargeables par n'importe qui depuis le site) et embarqués dans les apps des stores (un `.apk` ou `.ipa` se dézippe). Un tiers pourrait donc extraire un son brut. Que cela compte comme « redistribution du fichier tel quel » dépend de l'interprétation de Pixabay : **à vérifier / risque assumé**.

Ce qui l'atténue (réel, déjà fait selon CREDITS.md) : fichiers **coupés** (30 à 60 s), **mixés mono/stéréo, normalisés à -20 LUFS, ré-encodés** en Opus et MP3, **joués dans une scène interactive, mêlés à d'autres sons** (c'est l'usage prévu de la licence : on incorpore le son à une œuvre).
Ce qui ne l'atténue pas : le fichier reste un enregistrement quasi brut (une pluie coupée est toujours une pluie) ; il est accessible par son URL ; l'encodage et la normalisation ne changent pas la nature du fichier ; les mêmes fichiers dans un APK sont extractibles.
Pistes d'atténuation supplémentaires (au choix du propriétaire) : ne pas lister publiquement les URL (déjà le cas), éviter de proposer le téléchargement des sons, mêler plusieurs couches à l'encodage plutôt que servir une couche seule, remplacer à terme par du CC0 / acheté les sons les plus « nus ». Pour le robot : la clause vise le moissonnage du site Pixabay ; CREDITS.md dit que les fichiers ont été pris à la main, un par un : **garder cette preuve** et ne jamais scripter de téléchargement.

## d) Musique de la radio (28 morceaux, 124 Mo)

Morceaux « RhythmicInk » (artiste affiché dans les fichiers), fournis par le propriétaire en m4a (7 le 2026-10-17, 21 le 2026-10-18). CREDITS.md : « licence à confirmer par le propriétaire ». Le nom d'artiste évoque un outil ou un compte de génération musicale (**à vérifier**) : si les morceaux sont générés par IA, les conditions de l'outil et du plan (usage commercial, redistribution dans une appli, droit de revendre) décident de tout, et peuvent avoir changé depuis.
`docs/STORES.md` dit déjà de ne pas publier tant que ce n'est pas confirmé.

À conserver **hors dépôt** (dossier sauvegardé, plusieurs copies) :
- les fichiers m4a d'origine, avec leurs métadonnées (artiste, titre, date) ;
- les conditions d'utilisation / la licence de l'outil ou de la plateforme **à la date de création**, en PDF ou capture avec l'URL et la date ;
- le plan ou l'abonnement souscrit à ce moment-là (nom, dates, mention de l'usage commercial) et les **reçus / factures** ;
- l'historique de génération ou de téléchargement (date, identifiant du morceau, prompt éventuel) montrant que chaque morceau vient bien de ce compte ;
- toute confirmation écrite du support ou de l'auteur (courriel) sur l'usage commercial et l'embarquement dans une appli ;
- s'ils ne sont pas générés : le contrat ou la page de licence de l'artiste ou de la banque.
Si un seul de ces points manque pour un morceau, il est « à confirmer » ; la radio générative (`src/audio/stations.ts`) sert de repli, retirer les pistes puis lancer `npm run audio:check`.
Liste des 28 : `radio/` velvet-lounge, tape-drift, matcha-groove, matcha-groove-2, dusty-keys, midnight-drift, melancholic-jazz, quiet-corner, quiet-corner-2, quiet-corner-3, soft-focus, soft-focus-2, soft-focus-3, warm-cadence, warm-vinyl, velvet-keys, velvet-drift, dusty-keys-2, corner-booth, corner-seat, quiet-desk, dusk-in-kyoto, tokyo-dusk, shibuya-drizzle, rain-on-glass, tokyo-drizzle, kyoto-drizzle, gentle-drizzle.

## e) Priorités avant publication sur les stores

1. **Radio** : bloquant. Réunir les justificatifs du § d (ou retirer les 28 pistes : le repli génératif fonctionne). Cela change aussi le poids de l'appli (124 Mo en moins).
2. **Les 28 sons freesound_community** : retrouver l'id Freesound et la licence de chacun ; remplacer ceux qui ne sont pas CC0 ou introuvables. Tant que ce n'est pas fait, c'est un risque réel pour une appli commerciale.
3. **Sauvegarder les preuves Pixabay** : copie de `Téléchargements/pixabay-sources/` (fichiers d'origine, texte de licence daté, pages de chaque son) hors machine.
4. **Relire la Pixabay Content License à jour** et décider si la clause « standalone » est acceptable pour des fichiers servis tels quels (§ c) ; si non, remplacer les sons les plus nus par du CC0 / acheté.
5. **Mentions** : décider d'une page « Crédits et licences » dans l'appli (non obligatoire pour Pixabay et CC0 ; obligatoire si un CC BY entre) et d'un contact pour les réclamations.
6. **Garde-fou** : ne publier qu'avec `check-credits.cjs` sans erreur ; les avertissements restants doivent tous correspondre à une entrée de ce document.
Les licences changent : relire les pages officielles à la date de soumission aux stores.
