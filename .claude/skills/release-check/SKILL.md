---
name: release-check
description: Vérification complète de LufiRoom avant de pousser une mise en ligne (Cloudflare republie à chaque push sur main). À lancer quand l'utilisateur dit « commit et push », « on met en ligne », « c'est prêt ? », ou après un gros lot de changements. Rejoue en quelques minutes tout ce qui a déjà cassé une fois : types et build, musique des stations, traductions manquantes, sons sans crédit, fuites mémoire au changement de pièce, temps de chargement, affichage à 390 px, console. Produit un rapport court ; ne commite et ne pousse que sur demande.
---

# Avant de mettre en ligne

Chaque push sur `main` part en production (Cloudflare Workers, `wrangler.jsonc`, adresse `lufiroom.an-alexcore.workers.dev`). Cette liste rejoue les vérifications qui ont déjà attrapé un vrai défaut. Ne saute une étape que si le changement ne la concerne vraiment pas, et dis-le dans le rapport.

## 1. Mécanique (2 minutes)

```bash
npx tsc --noEmit -p .
npm run build
npm run stations                                    # si la radio générative ou stations.ts a bougé
node .claude/skills/release-check/check-i18n.cjs    # chaque texte des pièces a sa traduction anglaise
node .claude/skills/release-check/check-credits.cjs # chaque son de public/audio est crédité
git status --short                                  # rien d'inattendu (audio-src n'est pas suivi)
```

Pour une pièce retouchée, ajoute `npm run test:smoke` (ou `LOFI_SMOKE_ROOMS=<pièces> npm run test:smoke`) : il affiche les **triangles par image** de chaque pièce et échoue au-dessus de 1 000 000 ; les pièces tiennent aujourd'hui entre 110 000 et 540 000 (relevé du 2026-11-11 : phare 118 000 → onsen 537 000, sous-marin 505 000, train 434 000), une hausse nette est une régression. Note le tableau dans le rapport.

Tout doit sortir propre. `check-i18n` ne voit que les textes des pièces et des stations : un texte d'interface nouveau (`src/ui/`) se vérifie à la main dans `src/i18n.ts`.

## 2. Dans le navigateur (dev, page isolée chrome-devtools)

Méthode et pont de test : skill `audit-room`, étape 0. **Sans chrome-devtools (session cloud)** : `node .claude/skills/audit-room/capture.mjs <dossier> [pièces] [--mobile] [--sounds] [--check]` fait la console (erreurs affichées), les tracés, les triangles, les captures jour et nuit ; les scripts de ce skill se passent à `page.evaluate`. Le test de fumée (`npm run test:smoke`) couvre la console et le canvas dans tous les cas.

1. **Console** : toutes les pièces visitées, quelques sons allumés dans chacune : aucune erreur, aucun « Enregistrement indisponible ».
2. **Sons nouveaux ou changés** : niveaux mesurés (skill `source-sounds`, étape 4).
3. **Fuite au changement de pièce** : **par pièce**, pas par tour. Un tour de toutes les pièces reste bruité (+4 à +6 sur certains passages sans pièce coupable) ; la méthode par pièce a trouvé les deux vraies fuites (2026-11-12). Pour chaque pièce R : `goto(R)`, attendre que `gl.info.memory` soit stable (rAF, 8 lectures identiques), `goto('bedroom')`, stable de nouveau ; trois paires. On ignore la première visite (elle remplit les caches : shaders, textures partagées). La liste des pièces vient de `rooms` dans `src/rooms/index.ts` (même ordre, ajoute toute pièce nouvelle).

   **Durée réelle (rendu logiciel, 2026-11-12) : compte 1 minute par pièce sur une machine libre (train 50 s, marché 65 s), 2 à 6 minutes quand d'autres navigateurs tournent en même temps (mesuré sur les 15 pièces : 80 s la chambre, 100 à 240 s la plupart, 340 à 370 s l'onsen et le marché)**, soit 15 à 20 minutes pour les 15 pièces sur machine libre, deux fois plus avec deux navigateurs qui se disputent le processeur. Un appel `evaluate` à la fois par pièce, dans un script Playwright lancé en arrière-plan (`nohup node … &`) ; ne l'enchaîne pas dans un seul appel d'outil de moins de 2 minutes. **Le serveur de développement recharge la page à chaque fichier modifié** (et au tout premier chargement, pendant l'optimisation des dépendances) : l'`evaluate` meurt alors (« Execution context was destroyed »). Lance le script quand personne ne touche au code, et enveloppe chaque pièce d'un `try / catch` qui recharge la page et recommence.

```js
async (ids) => {
  const frames = (n) => new Promise((res) => { let i = 0; const t = () => (++i >= n ? res() : requestAnimationFrame(t)); requestAnimationFrame(t) })
  const st = window.__lofi.store, gl = window.__lofi.three().gl
  const read = () => { const m = gl.info.memory; return [m.geometries, m.textures] }
  const stable = async () => { let last = '', same = 0; for (let n = 0; n < 600 && same < 8; n++) { await frames(1); const s = read().join('/'); same = s === last ? same + 1 : 0; last = s } return read() }
  const goto = async (r) => { st.getState().goto(r); while (st.getState().room !== r || st.getState().leaving) await frames(1) }
  const rising = (v) => v[1] > v[0] && v[2] > v[1]   // monte à chaque visite (1 -> 2 -> 3)
  const out = {}
  for (const r of ids) {
    const room = [], back = []   // [géométries, textures] dans la pièce / une fois revenu dans la chambre, aux visites 1, 2, 3
    for (let k = 0; k < 3; k++) { await goto(r); room.push(await stable()); await goto('bedroom'); back.push(await stable()) }
    const col = (rows, i) => rows.map((x) => x[i])
    const fuit = rising(col(back, 0)) || rising(col(back, 1)) || rising(col(room, 0)) || (rising(col(room, 1)) && room[2][1] - room[0][1] >= 4)
    out[r] = (fuit ? 'FUIT  ' : 'ok    ') + room.map((x) => x.join('/')).join(' ') + '  ->  chambre ' + back.map((x) => x.join('/')).join(' ')   // géométries/textures, visites 1 2 3
  }
  return out
}
```

   Appel : `ids = ['train']` (une pièce par appel), etc. Le verdict `FUIT` veut dire : les géométries (dans la pièce ou une fois revenu dans la chambre) ou les textures de retour dans la chambre MONTENT à chaque visite, ou les textures de la pièce gagnent 4 ou plus sur les visites 2 et 3. Les chiffres de la chambre (131/23 à 131/26) et ±1 texture dans la pièce sont du bruit (évènements rares qui créent une texture, tirés pendant la visite ; le marché a fait 48, 49, 50 dans la pièce pendant une passe chargée (évènements rares tirés pendant la visite) puis 48, 48, 48 sur machine libre, et revient à 24, 25, 25 et reste à 51 ou 52 sur quatre visites chronométrées en images : pas une fuite). Si une pièce est douteuse, refais-la avec 4 visites et un nombre d'images fixe (60 images) au lieu de « stable ». Pour trouver *quoi* fuit, enveloppe `ctx.createTexture` / `deleteTexture` (`gl.getContext()`) et compare les identifiants vivants après chaque retour dans la chambre, puis regarde le composant qui crée ces ressources. Le bus audio (`Object.keys(window.__lofi.audio.bus).length`) se compte de la même façon : une hausse = un canal pas déchargé (`evict` dans `engine.ts`).
   Causes connues : (a) un `useMemo` à dépendance neuve à chaque rendu du parent (tableau ou objet littéral dans le JSX) qui refabrique une texture ou une géométrie jamais libérée : `GlowPoints` (+1 géométrie par visite, train et toit), `Blade` du marché (+3 à +5 textures) ; correctif : clé sur le contenu et `dispose()` au démontage (`docs/ROOMS.md`) ; (b) une ressource créée hors JSX et absente de la scène, que `freeScene` (`Stage.tsx`) ne voit pas ; (c) un canal audio non déchargé. Ne touche ni `freeScene`, ni `ContextGuard`, ni `makeCanvas` pour masquer une fuite : corrige le composant.
   Pour les captures : `capture.mjs` pose lui-même `window.__lofi.mood.night` (le fondu jour / nuit suit l'horloge et le rendu logiciel plafonne le pas de temps) ; fais de même si tu photographies à la main.
4. **Affichage mobile** : `emulate 390x844x2,mobile,touch`, captures de 2 ou 3 pièces (dont celles qui ont changé), jour et nuit : rien ne déborde, les puces et le mixeur tiennent, les boutons ne se chevauchent pas. Remets ensuite `1440x900x2`.

- **Retour sur l'onglet** : perds puis rends le contexte WebGL (`WEBGL_lose_context`), la pièce doit revenir entière, sans texture noire.
- **Le dehors** : chaque pièce retouchée dit où elle est (matières et repères du lieu) et garde l'échelle de la pièce ; les quatre coins du haut de l'écran sont remplis.
- **Le fond** : capture plein écran de chaque pièce retouchée, aucun aplat de ciel vide derrière la pièce (skill `audit-room`, étape 3 bis).

## 2 bis. Rendu et performances (si le moteur, `Stage.tsx`, `Lights.tsx`, `scenes.ts` ou `vite.config.ts` ont bougé)

- **JS de départ** : `npm run build`, lis les tailles. Aujourd'hui `index` ≈ 230 Ko et `three` ≈ 960 Ko (gzip 71 et 263 Ko) ; une scène de pièce est un chunk à part (40 à 120 Ko). Un fichier qui remonte à 2 Mo veut dire qu'un import statique a ramené les 15 pièces dans le bundle : `scenes.ts` n'importe une pièce qu'avec `import()`.
- **Hors ligne** : le précache liste tous les chunks (≈ 77 entrées, 2,7 Mo) ; `npm run preview`, puis coupe le réseau et change de pièce.
- **Rendu au repos** : `Stage.tsx` rend à pleine fréquence 4 s après une action, à 30 images par seconde ensuite, 20 pendant le minuteur, rien quand l'onglet est caché (`FrameGovernor`, `frameloop="never"` : `invalidate()` n'y fait rien, tout passe par `advance()`). Si tu ajoutes un état qui doit relancer le rendu, il passe par le store. `gl.info.autoReset` reste à `true` (le test de fumée lit `gl.info.render`).
- **Ombres** : 2048 partout (en 1024 sur téléphone, les bords d'ombre glissaient sur les murs en flottant : « ça clignote », 2026-11-11). Ne la rebaisse pas sans regarder un ponton et une façade en mouvement sur un vrai téléphone.
- **Sphères et boîtes** : `Part` et `Batch` choisissent `SPH_MID` / `SPH_LO` d'après la taille ; vérifie en gros plan qu'une forme lisse proche de la caméra (coussin, chat, dôme) garde `SPH`.

## 3. Le site construit (production locale)

```bash
npm run build
npx vite preview --port 4173   # en arrière-plan ; arrêter ensuite : pkill -f "vite preview"
```

Ouvre `http://localhost:4173/` cache vidé (`navigate_page` avec `ignoreCache`), mesure la disparition de l'écran de chargement :

```js
async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const t0 = performance.now(); while (document.getElementById('splash') && performance.now() - t0 < 60000) await sleep(100); return Math.round(performance.now()) + ' ms' }
```

Référence : ~5 s sur un ordinateur rapide (octobre 2026). Une hausse nette = régression (compilation des shaders, fichier trop lourd préchargé). Vérifie aussi qu'un son répond en `audio/webm` et qu'un fichier absent répond 404.

## 4. Rapport (à coller dans la réponse)

```
Mécanique : tsc ✓ build ✓ stations ✓/— traductions ✓ (N textes) crédits ✓ (N fichiers) — triangles par pièce (test de fumée) — JS de départ
Navigateur : console ✓ — fuite : tour 1 G/T, tour 2 G/T — niveaux : …
Mobile 390 : pièces vues …
Production locale : écran de chargement X s
Non vérifié : … (et pourquoi)
```

Puis, **seulement si l'utilisateur l'a demandé** : commit (message en français, ce qui change et pourquoi, ligne d'attribution) et push. Après le push : le site en ligne republie en 1 à 2 minutes ; propose de le vérifier (page, `audio/webm`, service worker actif).
