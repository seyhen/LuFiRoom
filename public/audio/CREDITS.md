# Crédits audio

Chaque fichier de `public/audio/` est listé ici avec sa source et sa licence. Pas de ligne, pas de fichier.

**Licences acceptées** : CC0 (domaine public), ou licence achetée qui autorise l'usage commercial.
Tout le reste (CC BY, CC BY-NC, « gratuit pour usage personnel », musique « libre de droits » sans licence écrite…) :
on demande avant de l'utiliser.

Pour chaque fichier, garde aussi la page ou le reçu de la licence (capture ou PDF) hors du dépôt, avec le fichier source d'origine.

## Boucles d'ambiance (chambre et cabane)

Toutes viennent de Pixabay, sous la **Pixabay Content License** (<https://pixabay.com/service/license-summary/>) : usage commercial et modification autorisés, pas de mention obligatoire, **pas du CC0**.
Interdit : revendre ou redistribuer le fichier tel quel (« standalone »), et récupérer du contenu par script ou robot. Chaque fichier ci-dessous est coupé, remixé en mono ou stéréo, normalisé à -20 LUFS, encodé (Opus et MP3) et joué dans une scène interactive, mêlé à d'autres sons.
Accord donné par le propriétaire du projet le 2026-10-02 (la règle « CC0 ou achetée » du projet a été écartée pour Pixabay). Fichiers téléchargés à la main dans le navigateur, un par un. Pour les sons dont l'auteur d'origine est indiqué « (Freesound) », Pixabay est l'intermédiaire (compte `freesound_community`).
Sources d'origine et copie du texte de licence, hors dépôt : `Téléchargements/pixabay-sources/`.

| Fichier | Contenu | Auteur | Source (lien) | Licence | Retouches | Ajouté le |
|---|---|---|---|---|---|---|
| `bedroom/rain` | pluie sur une vitre, « Gentle Rain on Window » | Eryliaa | <https://pixabay.com/sound-effects/nature-gentle-rain-on-window-350529/> (publié le 2025-05-28) | Pixabay Content License | 30 s à partir de 51,5 s, mono | 2026-10-02 |
| `bedroom/fan` | ventilateur de bureau, « Desk Fan » | Db1187 (Freesound), via freesound_community | <https://pixabay.com/sound-effects/household-desk-fan-66784/> (publié le 2023-06-06) | Pixabay Content License | entier (22 s), mono | 2026-10-02 |
| `bedroom/purr` | chat qui ronronne, « Purring Cat » (chambre et cabane) | Universfield | <https://pixabay.com/sound-effects/nature-purring-cat-156459/> (publié le 2023-07-03) | Pixabay Content License | entier (6,9 s), mono | 2026-10-02 |
| `bedroom/birds` | oiseaux le matin, « Morning birdsong » | Krikas | <https://pixabay.com/sound-effects/nature-morning-birdsong-125418/> (publié le 2022-11-10) | Pixabay Content License | 38 s à partir de 22 s, mono | 2026-10-02 |
| `bedroom/crickets` | grillons la nuit, « Night cricket ambience » | Abinash87 (Freesound), via freesound_community | <https://pixabay.com/sound-effects/nature-night-cricket-ambience-22484/> (publié le 2023-07-25) | Pixabay Content License | 30 s à partir de 5 s, mono | 2026-10-02 |
| `cabin/fire` | feu de cheminée, « Fireplace Fire Crackling - Loop » | SoundsForYou | <https://pixabay.com/sound-effects/nature-fireplace-fire-crackling-loop-123930/> (publié le 2022-10-25) | Pixabay Content License | 30 s à partir de 150 s, mono | 2026-10-02 |
| `cabin/wind` | vent froid, « Smooth Cold Wind - Looped » | Shut_Up_Ghost | <https://pixabay.com/sound-effects/nature-smooth-cold-wind-looped-135538/> (publié le 2023-01-18) | Pixabay Content License | 40 s à partir de 125 s, stéréo | 2026-10-02 |

## Boucles ajoutées le 2026-10-17 (café, atelier, plage, train)

Toutes viennent de Pixabay, sous la **Pixabay Content License** (<https://pixabay.com/service/license-summary/>), comme les précédentes (accord du propriétaire du projet du 2026-10-02, étendu le 2026-10-17 à ces dix fichiers). Fichiers téléchargés depuis le navigateur du propriétaire, via l'extension Claude à sa demande expresse. Sources d'origine : `Téléchargements/pixabay-sources/`. Les sons dits « freesound_community » viennent de Freesound, redistribués par Pixabay.

| Fichier | Contenu | Auteur | Source (lien) | Retouches | Ajouté le |
|---|---|---|---|---|---|
| `cafe/murmur` | brouhaha de café, « Coffee Shop Ambience » | freesound_community | <https://pixabay.com/sound-effects/people-coffee-shop-ambience-27829/> | 48 s à partir de 6 s, mono | 2026-10-17 |
| `cafe/pages` | pages qu'on tourne, « turning paper, turning page » | sarthakraj_308 | <https://pixabay.com/sound-effects/film-special-effects-turning-paper-turning-page-290380/> | entier (26 s), mono | 2026-10-17 |
| `cafe/rain`, `atelier/rain`, `train/rain` | pluie, « CALMING RAIN » | Liecio | id 257596 sur Pixabay (recherche « calming rain liecio ») | trois passages de 45 s (à 10 s, 45 s, 62 s), mono | 2026-10-17 |
| `cafe/fire` | feu qui crépite, « Fire Crackling Sound » | SoundReality | id 499636 sur Pixabay (recherche « fire crackling sound soundreality ») | 40 s à partir de 8 s, mono | 2026-10-17 |
| `atelier/keys` | clavier, « Keyboard Typing ASMR » | DRAGON-STUDIO | id 356118 sur Pixabay (recherche « keyboard typing asmr ») | entier (8 s), mono | 2026-10-17 |
| `atelier/kettle` | eau qui bout, « Boiling Water Sound » | freesound_community | id 62556 sur Pixabay (recherche « boiling water sound ») | entier (16 s), mono | 2026-10-17 |
| `beach/waves` | vagues, « Ocean Waves » | RMultimediaEU | id 250310 sur Pixabay (recherche « ocean waves rmultimediaeu ») | 45 s à partir de 0 s, stéréo | 2026-10-17 |

## Bruits colorés (calculés, pas enregistrés)

Générés par `scripts/make-noises.mjs` (`npm run noises`, puis `npm run audio`) : aucune source extérieure, aucune licence à respecter, les fichiers appartiennent au projet.
Pas encore déclarés dans une pièce (voir `docs/ASSETS.md`).

| Fichier | Contenu | Pente | Durée |
|---|---|---|---|
| `noise/white` | bruit blanc | 0 dB / octave | 20 s, stéréo |
| `noise/pink` | bruit rose | -3 dB / octave | 20 s, stéréo |
| `noise/brown` | bruit brun | -6 dB / octave | 20 s, stéréo |
| `noise/blue` | bruit bleu | +3 dB / octave | 20 s, stéréo |
| `noise/violet` | bruit violet | +6 dB / octave | 20 s, stéréo |

## Radio lofi

| Fichier | Titre | Artiste | Source (lien) | Licence | Tempo (bpm) | Ajouté le |
|---|---|---|---|---|---|---|
| `radio/velvet-lounge` | Velvet Lounge | RhythmicInk | fichier fourni par le propriétaire du projet (m4a, 177 s) | à confirmer par le propriétaire | 78 | 2026-10-17 |
| `radio/tape-drift` | Tape Drift | RhythmicInk | idem (177 s) | idem | 64 | 2026-10-17 |
| `radio/matcha-groove` | Matcha Groove | RhythmicInk | idem (181 s) | idem | 82 | 2026-10-17 |
| `radio/matcha-groove-2` | Matcha Groove II | RhythmicInk | idem (177 s, seconde version) | idem | 82 | 2026-10-17 |
| `radio/dusty-keys` | Dusty Keys | RhythmicInk | idem (172 s) | idem | 82 | 2026-10-17 |
| `radio/midnight-drift` | Midnight Drift | RhythmicInk | idem (176 s) | idem | 74 | 2026-10-17 |
| `radio/melancholic-jazz` | Melancholic Lo-Fi Jazz Cover | RhythmicInk | idem (176 s) | idem | 74 | 2026-10-17 |
| `radio/quiet-corner` | Quiet Corner | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 75 | 2026-10-18 |
| `radio/quiet-corner-2` | Quiet Corner II | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/quiet-corner-3` | Quiet Corner III | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 73 | 2026-10-18 |
| `radio/soft-focus` | Soft Focus | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 64 | 2026-10-18 |
| `radio/soft-focus-2` | Soft Focus II | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 75 | 2026-10-18 |
| `radio/soft-focus-3` | Soft Focus III | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 90 | 2026-10-18 |
| `radio/warm-cadence` | Warm Cadence | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/warm-vinyl` | Warm Vinyl | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 75 | 2026-10-18 |
| `radio/velvet-keys` | Velvet Keys | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/velvet-drift` | Velvet Drift | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 90 | 2026-10-18 |
| `radio/dusty-keys-2` | Dusty Keys II | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 75 | 2026-10-18 |
| `radio/corner-booth` | Corner Booth | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/corner-seat` | Corner Seat | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 81 | 2026-10-18 |
| `radio/quiet-desk` | Quiet Desk | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 76 | 2026-10-18 |
| `radio/dusk-in-kyoto` | Dusk in Kyoto | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 76 | 2026-10-18 |
| `radio/tokyo-dusk` | Tokyo Dusk | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/shibuya-drizzle` | Shibuya Drizzle | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 75 | 2026-10-18 |
| `radio/rain-on-glass` | Rain On Glass | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 90 | 2026-10-18 |
| `radio/tokyo-drizzle` | Tokyo Drizzle | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/kyoto-drizzle` | Kyoto Drizzle | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 60 | 2026-10-18 |
| `radio/gentle-drizzle` | Gentle Drizzle | RhythmicInk | fichier fourni par le propriétaire du projet (m4a) | à confirmer par le propriétaire | 64 | 2026-10-18 |

## Sons d'interface

Les « pops » d'allumage et d'extinction sont synthétisés dans le navigateur (`src/audio/engine.ts`) : aucun fichier.

Les vingt-huit morceaux sont ceux que le propriétaire a fournis (sept le 2026-10-17, vingt et un le 2026-10-18) (artiste affiché dans les fichiers : « RhythmicInk »). Leur licence d'usage commercial est à renseigner (outil de génération, plan, date) avant toute mise en vente : voir docs/ASSETS.md. Tempo et premier temps mesurés par analyse du signal.

## Sons synthétisés

Tant qu'un son n'a pas d'enregistrement dans `loops` de sa pièce (`src/rooms/`), il reste synthétisé en direct (moteur de la phase 1) : rien à créditer. C'est le cas de la radio, tant qu'aucune piste n'est déclarée : ses cinq stations sont calculées en direct (`src/audio/stations.ts`).
Chaque pièce a désormais des enregistrements pour ses sons (voir les sections ci-dessus). Restent synthétisés : la cloche de bouée du phare, les oiseaux et les grillons du jardin de l'onsen, la pluie du marché et les vagues du phare, ainsi que la radio.

## Boucles ajoutées le 2026-10-17 (toit, onsen, phare, sous-marin, marché, plage, train)

Pixabay Content License (exception accordée par le propriétaire, voir CLAUDE.md). Fichiers coupés et mis à −20 LUFS par `npm run audio`.

| Fichier | Titre | Auteur | Id Pixabay |
|---|---|---|---|
| beach/gulls | Seagull - Sound Effect | u_up4clmd95a | 272695 |
| beach/chimes (plage, onsen) | Wind Chimes Bells | SoundsForYou | 115747 |
| roof/city | City-Above-Far-Ambience-Car | CliffordJohnson | 479129 |
| roof/pigeons | pigeon | freesound_community | 36137 |
| roof/wind (toit, phare) | Wind Blowing | SoundReality | 457954 |
| roof/fire → audio/cafe/fire | Fire Crackling Sound (déjà au café) | SoundReality | 499636 |
| lighthouse/fire | Fire in the stove | freesound_community | 6468 |
| onsen/spring | Water Trickling | freesound_community | 31169 |
| onsen/outside (garden) | water-spout-japanese-garden-botanical-gardens | freesound_community | 35014 |
| lighthouse/foghorn | Long Distant Foghorn | freesound_community | 40915 |
| submarine/sonar | Sonar | VoiceBosch | 183436 |
| submarine/bubbles | Water Bubbles | Liecio | 257594 |
| submarine/hull | Submarine | DominiqueLACAUD | 289985 |
| submarine/engine | G45-24-Submarine Interior Engine Room | freesound_community | 59300 |
| market/sizzle | Frying in a pan | freesound_community | 6017 |
| market/tram | Tram, transport, road, wheel noise, rails | SSPsurvival | 10342 |
| market/simmer | Cauldron Boiling | Irhouen | 173607 |

## Sons des objets ajoutés le 2026-10-24 (un par pièce)

Pixabay Content License (accord du propriétaire du projet), téléchargés depuis son navigateur via l'extension Claude à sa demande. Sources d'origine : `Téléchargements/pixabay-sources/`. Les sons « freesound_community » viennent de Freesound, redistribués par Pixabay. Découpés à 60 s au plus, mono, ramenés à −20 LUFS par `npm run audio`.

| Fichier | Titre | Auteur | Id Pixabay |
|---|---|---|---|
| `bedroom/mist` | YUASA YHY-80P Steam Humidifier | freesound_community | 61668 |
| `cabin/knit` | knitting and dropping metal knitting needle | freesound_community | 28092 |
| `beach/rainstick` | Rain stick 2 | freesound_community | 48494 |
| `train/cards` | Shuffling Playing Cards | freesound_community | 19937 |
| `roof/watering` | Watering with a Watering Can | freesound_community | 39121 |
| `atelier/brush` | Paint brush | freesound_community | 57324 |
| `onsen/whisk` | whisking | freesound_community | 44551 |
| `lighthouse/quill` | Writing sound loop | freesound_community | 57001 |
| `cafe/drip` | Water Dripping | DRAGON-STUDIO | 364450 |

## Enregistrements réutilisés par d'autres pièces (2026-11-07)

Aucun nouveau fichier : ces pièces déclarent dans `loops` des enregistrements déjà listés plus haut (mêmes sources, mêmes licences).
`roof/wind` (brise), `bedroom/birds` et `bedroom/crickets` (oiseaux le jour, grillons la nuit) dans la cabane perchée.

## Sons de la laverie et de la cabane perchée (2026-11-07)

Pixabay Content License (accord du propriétaire du projet), téléchargés depuis son navigateur via l'extension Claude. Sources d'origine : `Téléchargements/pixabay-sources/`. Sons « freesound_community » : Freesound, redistribués par Pixabay. Découpés à 60 s, mono, −20 LUFS par `npm run audio`.

| Fichier | Titre | Auteur | Id Pixabay |
|---|---|---|---|
| `laundromat/wash` | Washing Machine Soft | freesound_community | 60397 |
| `laundromat/tumble` | Dryer Hum | freesound_community | 63149 |
| `treehouse/brook` | Location Stream 1 | freesound_community | 23371 |
| `treehouse/cicadas` | Cicadas chirping at night | freesound_community | 54307 |

## Sons Freesound (CC0, récupérés par `npm run source`)

Licence **CC0** (domaine public) : aucune mention obligatoire. Aperçu MP3 de Freesound, coupé, ramené à −20 LUFS par `npm run audio`.

| Fichier | Titre | Auteur | Source | Licence | Retouches | Ajouté le |
|---|---|---|---|---|---|---|
| `greenhouse/frogs` | FrogsAndCrickets_ExcerptB_JMA_24Bit_48k.wav | greysound | <https://freesound.org/people/greysound/sounds/32655/> | CC0 | 45 s à partir de 5 s, stéréo | 2026-11-15 |
| `greenhouse/musicbox` | Music Box Lullaby Clip | AudioBitsAndBytes | <https://freesound.org/people/AudioBitsAndBytes/sounds/163644/> | CC0 | 45 s à partir de 0 s, mono | 2026-11-15 |
| `greenhouse/rainbarrel` | Rain Gutter Dripping.wav | ProductionNow | <https://freesound.org/people/ProductionNow/sounds/232300/> | CC0 | 45 s à partir de 5 s, mono | 2026-11-15 |
| `train/rails` | Riding Train interior recording | gecop | <https://freesound.org/people/gecop/sounds/525058/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `submarine/whale` | Diving with whales.wav | KEVOY | <https://freesound.org/people/KEVOY/sounds/82325/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `onsen/birds` | Early summer, czech wood outside the camp, early morning ambiance | J.Zazvurek | <https://freesound.org/people/J.Zazvurek/sounds/353311/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `lighthouse/bell` | S29-19 Bell buoy.wav | craigsmith | <https://freesound.org/people/craigsmith/sounds/675693/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `laundromat/gutter` | downspout-rainwater2.aif | alienistcog | <https://freesound.org/people/alienistcog/sounds/124976/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `laundromat/rinse` | BathFill.wav | 0XMUSEX0 | <https://freesound.org/people/0XMUSEX0/sounds/168651/> | CC0 | 46 s à partir de 0 s, mono | 2026-11-15 |
| `igloo/aurora` | Space and time (music) | xkeril | <https://freesound.org/people/xkeril/sounds/789392/> | CC0 | 34 s à partir de 0 s, mono | 2026-11-15 |
| `igloo/icehole` | icebergs 02 | rucisko | <https://freesound.org/people/rucisko/sounds/342447/> | CC0 | 41 s à partir de 0 s, mono | 2026-11-15 |
| `igloo/stove` | 20 seconds of smokies boiling on a camp stove | SoundsLikeYukon | <https://freesound.org/people/SoundsLikeYukon/sounds/864615/> | CC0 | 33 s à partir de 0 s, mono | 2026-11-15 |
| `igloo/husky` | ANIMAL_PUG_DOG_SLEEP_SNORE_INHALE_EXHALE_BREATH_H4N_NTG3_20120527.wav | samueljustice00 | <https://freesound.org/people/samueljustice00/sounds/156597/> | CC0 | 60 s à partir de 8 s, mono | 2026-11-15 |
| `cabin/purr` | Cat purr.wav | Trautwein | <https://freesound.org/people/Trautwein/sounds/260881/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `beach/purr` | Cat purring | cubilon | <https://freesound.org/people/cubilon/sounds/130968/> | CC0 | 38 s à partir de 0 s, mono | 2026-11-15 |
| `lighthouse/purr` | katzenmix.wav | ChaliceWell | <https://freesound.org/people/ChaliceWell/sounds/529605/> | CC0 | 34 s à partir de 0 s, mono | 2026-11-15 |
| `lighthouse/wind` | By the sea | OSFX | <https://freesound.org/people/OSFX/sounds/404696/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `treehouse/wind` | wind_forest_08_strong_l_01.wav | teadrinker | <https://freesound.org/people/teadrinker/sounds/403051/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `roof/fire` | fire crackles | florianreichelt | <https://freesound.org/people/florianreichelt/sounds/563766/> | CC0 | 51 s à partir de 0 s, mono | 2026-11-15 |
| `treehouse/crickets` | Cricket chirping | GB01 | <https://freesound.org/people/GB01/sounds/530477/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `onsen/crickets` | cricket | FunkApache | <https://freesound.org/people/FunkApache/sounds/393389/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `onsen/chimes` | Wind chimes 1 | giddster | <https://freesound.org/people/giddster/sounds/437337/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `treehouse/birds` | blackbird-evening.wav | echobones | <https://freesound.org/people/echobones/sounds/521558/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `cafe/street` | Soft ambience of street from interior terraced street Leeds, UK, Autumn | smellor123 | <https://freesound.org/people/smellor123/sounds/412012/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `cafe/espresso` | Coffee machine pouring espresso.wav | greatsoundstube | <https://freesound.org/people/greatsoundstube/sounds/628845/> | CC0 | 34 s, mono | 2026-11-15 |
| `lighthouse/waves` | 11ft waves breaking on sandy beach in the distance from the top of the cliff | chris_dagorne | <https://freesound.org/people/chris_dagorne/sounds/426074/> | CC0 | 60 s à partir de 0 s, stéréo | 2026-11-15 |
| `train/sand` | SAND POUR.wav | nicoproson | <https://freesound.org/people/nicoproson/sounds/627070/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `atelier/bowl` | SingingBowl.wav | Monkay | <https://freesound.org/people/Monkay/sounds/48325/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
| `onsen/waterfall` | Distant Waterfall 2 | Yoyodaman234 | <https://freesound.org/people/Yoyodaman234/sounds/348823/> | CC0 | 52 s à partir de 0 s, mono | 2026-11-15 |
| `weather/drizzle` | Rain light 2 (rural) | jmbphilmes | <https://freesound.org/people/jmbphilmes/sounds/200273/> | CC0 | 60 s à partir de 8 s, mono | 2026-11-15 |
| `weather/storm` | Rain heavy 2 (rural) | jmbphilmes | <https://freesound.org/people/jmbphilmes/sounds/200272/> | CC0 | 60 s à partir de 3 s, mono | 2026-11-15 |
| `weather/snow` | Snow falling in the city | xkeril | <https://freesound.org/people/xkeril/sounds/610317/> | CC0 | 60 s à partir de 12 s, mono | 2026-11-15 |
| `weather/blizzard` | Strong Winds inside house 01 | khenshom | <https://freesound.org/people/khenshom/sounds/623604/> | CC0 | 38 s à partir de 0 s, mono | 2026-11-15 |
| `beach/lapping` | R23-36-Water Against Wooden Boat.wav | craigsmith | <https://freesound.org/people/craigsmith/sounds/480838/> | CC0 | 24 s à partir de 0 s, mono | 2026-11-15 |
| `greenhouse/fountain` | Fountain_2.wav | skyko | <https://freesound.org/people/skyko/sounds/169254/> | CC0 | 60 s à partir de 0 s, mono | 2026-11-15 |
