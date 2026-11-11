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

Pour une pièce retouchée, ajoute `npm run test:smoke` (ou `LOFI_SMOKE_ROOMS=<pièces> npm run test:smoke`) : il affiche les **triangles par image** de chaque pièce et échoue au-dessus de 1 000 000 ; les pièces tiennent aujourd'hui entre 110 000 et 540 000, une hausse nette est une régression. Note le tableau dans le rapport.

Tout doit sortir propre. `check-i18n` ne voit que les textes des pièces et des stations : un texte d'interface nouveau (`src/ui/`) se vérifie à la main dans `src/i18n.ts`.

## 2. Dans le navigateur (dev, page isolée chrome-devtools)

Méthode et pont de test : skill `audit-room`, étape 0.

1. **Console** : toutes les pièces visitées, quelques sons allumés dans chacune : aucune erreur, aucun « Enregistrement indisponible ».
2. **Sons nouveaux ou changés** : niveaux mesurés (skill `source-sounds`, étape 4).
3. **Fuite au changement de pièce** : deux tours des douze pièces, puis comparer au premier tour :

```js
async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const st = window.__lofi.store, ids = ['bedroom','cabin','cafe','beach','train','roof','atelier','onsen','lighthouse','submarine','market','igloo','treehouse','laundromat']
  const out = {}
  for (const pass of [1, 2]) {
    for (const r of ids) { st.getState().goto(r); while (st.getState().room !== r || st.getState().leaving) await sleep(100); await sleep(1200) }
    st.getState().goto('bedroom'); while (st.getState().room !== 'bedroom' || st.getState().leaving) await sleep(100); await sleep(1500)
    const i = window.__lofi.three().gl.info
    out['tour ' + pass] = `géométries ${i.memory.geometries}, textures ${i.memory.textures}, bus audio ${Object.keys(window.__lofi.audio.bus).length}`
  }
  return out
}
```

   Les deux tours doivent donner les mêmes chiffres (à quelques unités près). Une hausse à chaque tour = une géométrie ou une texture créée hors JSX et jamais libérée (voir `freeScene` dans `Stage.tsx`), ou un canal audio pas déchargé (`evict` dans `engine.ts`). Le script dépasse 60 s : coupe-le en deux appels si besoin.
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
