# La carte « Bruit » (blanc, rose, brun, vert)

Une carte du mixeur dans **les quinze pièces** (son `noise`, dernière carte, volume par défaut 0,4, éteinte au départ), pour écouter du bruit de fond : se concentrer, couvrir un voisin, dormir. Comme la carte « Météo » (`rain`), c'est une **exception assumée** à la règle « pas de son répété d'une pièce à l'autre », et elle n'a pas d'objet 3D (pas de hotspot : le mixeur suffit).

## Ce qu'on règle

- **La couleur**, par quatre pastilles (boutons `aria-pressed`, 44 px au moins, libellés « Bruit blanc / rose / brun / vert ») : choisir une couleur allume le bruit, comme choisir une météo.
  - blanc : spectre plat (0 dB par octave) ;
  - rose : −3 dB par octave (filtre de Paul Kellet raffiné) ;
  - brun : −6 dB par octave (intégrateur à fuite, coupure vers 4 Hz) ;
  - vert : le blanc dans une bande large centrée sur 500 Hz (passe-bande, Q 0,7), les médiums de la nature.
- **La tonalité** (curseur « Tonalité », de « Grave » à « Aigu », double clic : retour au neutre) : une paire d'étagères (320 Hz et 3 200 Hz) qui basculent en sens contraire, ±6 dB à chaque bout du spectre (soit 12 dB d'écart entre les graves et les aigus à fond).
- Le volume est celui des autres cartes.

Changer de couleur ou de tonalité se fait en **fondu** (constante de temps 0,15 s) : les quatre couleurs sont toujours là, on déplace des gains, pas de clic. Un passe-haut de 25 Hz (2 biquads) ôte le très grave inutile.

## Comment c'est fait

- `public/noise-worklet.js` : le processeur `lufi-noise`, un **AudioWorklet** qui génère le bruit en direct (xorshift32, deux canaux de graines différentes : stéréo décorrélée). Trois sorties stéréo (blanc, rose, brun) ; le vert se fait dans le graphe à partir du blanc. **Aucune boucle, aucun fichier audio.** C'est un fichier statique de `public/` : `dist/noise-worklet.js`, précaché par le service worker (`globPatterns` contient `js`), chargé par `audioWorklet.addModule(BASE_URL + 'noise-worklet.js')`.
- `src/audio/channels/noise.ts` : le graphe (gains de couleur, passe-bande vert, étagères, passe-haut). La source n'est branchée que quand le son joue (elle se débranche 3 s après l'extinction : arrêtée, elle ne coûte rien).
- **Repli** si l'AudioWorklet manque ou si `addModule` échoue (message `console.warn`) : `src/audio/noiseGen.ts` écrit les mêmes formules dans trois tampons de **30 s** sans couture (fondu de 1 s de la queue dans la tête, puissance constante), environ 35 Mo. Les deux fichiers ont les mêmes constantes de niveau : garde-les d'accord.
- `src/state/noise.ts` : types, noms et sous-titres des couleurs, lecture et écriture de `localStorage` (`chambre-lofi.noise`), nettoyage de ce qui vient d'un stockage ou d'un lien. L'état (`noise: { color, tilt }`) est dans le store, **partagé par toutes les pièces** comme les volumes ; `setNoiseColor`, `setNoiseTilt`.
- `src/ui/NoiseControls.tsx` : les pastilles et le curseur, rendus par `MixerCard` sous le volume quand le son est `noise` (la carte est plus large : 236 px, 224 px sous 400 px de large).

## Niveaux

Les quatre couleurs sont calées pour la **même sonie pondérée A** (le blanc à RMS 0,2 avant `base`, le rose et le brun au même niveau A ; le brun garde plus de puissance brute, ses graves comptant plus fort au casque). Le `base` du canal (0,5, dans `engine.ts`) cale le rose à 0,4 sur le niveau pondéré A du ventilateur et de la pluie à leur volume par défaut (mesure avec `window.__lofi.audio`, un `AnalyserNode` branché sur `bus['<pièce>/noise']`, en dev). Pentes mesurées dans Chromium (FFT, 125 Hz à 8 kHz) : blanc −0,06, rose −3,13, brun −6,01 dB/octave ; même chose avec le repli par tampons.

## Dans les ambiances

Une ambiance enregistrée ou partagée qui contient `noise` porte aussi `noise: { color, tilt }` (`Mix.noise`, voir `docs/MIXES.md`) ; lien : `&noise=brown&tilt=-30` (`tilt` en % de −100 à 100). Une ambiance sans bruit reste valide (rien ne change au réglage de la carte) ; une couleur inconnue est ignorée. Le nom de l'ambiance dit la couleur (« Bruit rose · Feu de bois »).
