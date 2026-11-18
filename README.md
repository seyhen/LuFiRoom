# LufiRoom

Webapp d'ambiance sonore : des pièces en 3D isométrique, style « gummy », où chaque objet est un interrupteur de son. Seize pièces aujourd'hui (chambre, cabane, café, plage, train de nuit, toit-terrasse, atelier, onsen, phare, sous-marin, marché de nuit, igloo, cabane perchée, laverie de nuit, serre, tente de camping).

On touche la radio pour lancer la musique, le ventilo pour le souffle, le chat pour son ronron… On choisit la météo (pluie, orage, neige…) dans le sélecteur du haut, on règle la carte « Bruit » (blanc, rose, brun, vert), et on compose son ambiance pour travailler, lire ou dormir. La radio est générative (stations de lofi calculées en direct, avec de vrais morceaux quand ils sont présents). Interface en français et en anglais, installable (PWA, et coque mobile Capacitor).

Stack : Vite, React 18, TypeScript strict, React Three Fiber, Zustand, Web Audio natif.

## Démarrer en local

```
npm install
npm run dev        # serveur local (Vite)
```

Le son ne démarre qu'après un premier toucher (règle d'autoplay des navigateurs).

## Commandes principales

| Commande | Rôle |
|---|---|
| `npm run build` | `tsc` strict puis build Vite (doit passer avant chaque commit) |
| `npm run preview` | sert `dist/` (le service worker n'est actif que dans ce build) |
| `npm run stations` | vérifie la musique des stations de la radio |
| `npm run test:smoke` | test de fumée dans Chromium, chaque pièce en 390 px et en desktop (`npx playwright install chromium` une fois) |
| `npm test` | build + stations + test de fumée (ce que la CI lance) |
| `npm run audio` | encode les sources sonores vers `public/audio/` (ffmpeg requis) |
| `npm run audio:check` | crêtes, sonie et paires webm + mp3 des sons |
| `npm run audio:levels` | sonie de chaque canal |
| `npm run mobile:sync` | construit et copie le site dans les apps Android et iOS |

La CI GitHub (`.github/workflows/ci.yml`) lance ces vérifications à chaque push et pull request.

## Pour aller plus loin

- `CLAUDE.md` : contexte du projet, structure du code, conventions, direction artistique, défauts à traquer. Lu automatiquement par Claude Code.
- `docs/` : `PLAN.md` (phases et état), `ROOMS.md` (faire une pièce, budget de dessin), `RADIO.md`, `WEATHER.md`, `NOISE.md`, `MIXES.md`, `ASSETS.md` (sons), `PWA.md`, `DEPLOY.md`, `MOBILE.md`, `STORES.md`, `LICENCES.md`, `PROTOTYPE.md` et `prototype.html` (le prototype de référence du moteur), `captures/`.
- `public/audio/CREDITS.md` : source et licence de chaque son.
