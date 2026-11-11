---
name: audit-room
description: Audit d'une pièce de LufiRoom (nouvelle ou retravaillée) avant de dire qu'elle est finie. À lancer dès qu'on crée, refait ou retouche beaucoup une pièce, un objet ou une ambiance, ou quand l'utilisateur parle de bug de texture, d'objet qui scintille, qui traverse un autre, d'objet « pas assez travaillé » ou d'ambiance pas unique. Vérifie les bugs mécaniques (tracés, lumières, sons, ancres, interpénétrations), regarde chaque objet en gros plan, jour et nuit, mobile compris, et note la profondeur de travail par rapport à la plage et au toit-terrasse.
---

# Auditer une pièce de LufiRoom

Une pièce n'est **pas finie parce qu'elle compile**. Elle l'est quand chaque objet, vu en gros plan, se comprend et que la pièce a une ambiance qu'aucune autre n'a. Ce skill rend ça mécanique : on ne dit « fini » qu'avec le rapport de la dernière étape, rempli avec des **preuves** (captures recadrées, chiffres), pas des impressions.

Références de qualité : **la plage** (`src/scene/beach/`) et **le toit-terrasse** (`src/scene/roof/`). Ouvre-les avant de juger une autre pièce : c'est ce niveau de soin qu'on vise (bouteilles à épaule et capsule, plantes en vraies feuilles, lumières propres, vie qui bouge).

Règles de la maison à garder en tête : `CLAUDE.md` (« Le soin des ambiances ») et `docs/ROOMS.md` (« Les défauts qui reviennent »). Ne commite rien sans demande.

## Étape 0 — Préparer l'outillage (et aller vite)

**Sans chrome-devtools (session cloud, conteneur)** : `preview_start`, `emulate`, `take_screenshot` et `evaluate_script` n'existent pas. Lance `npx vite --port 5173` en arrière-plan, puis le script Playwright du skill (Chromium est déjà installé, ne réinstalle rien) :

```bash
node .claude/skills/audit-room/capture.mjs <dossier> [pièces,séparées,par,des,virgules] [--mobile] [--sounds] [--check]
bash .claude/skills/audit-room/pair.sh <dossier> <pièce> [x y w h]    # planche jour | nuit côte à côte
```

Il visite chaque pièce de jour et de nuit **dans une seule page** (jamais plusieurs navigateurs en parallèle : le rendu logiciel est à 1 image par seconde, deux navigateurs font expirer les captures), compte tracés et triangles, `--sounds` allume tous les sons avant la capture, `--check` lance aussi `overlaps.js` et `coplanar.js` et écrit leurs lignes dans `<dossier>/checks.json`. Compte 1 à 2 minutes par vue. Les étapes qui suivent décrivent les mêmes gestes avec chrome-devtools ; elles s'appliquent telles quelles via `page.evaluate`.

Ce qui prend du temps dans les tests, par ordre : **recharger la page** (chaque pièce visitée recompile ses shaders : 20 à 30 s la première fois, 1,5 s ensuite), les attentes fixes (`sleep` de 3 s « au cas où »), cliquer bouton par bouton, et lire une capture par objet. Les règles :

1. **Une seule page, jamais de rechargement** sauf si tu as changé `store.ts`, `engine.ts` ou `main.tsx`. Le rechargement à chaud de Vite met à jour les scènes sans rien recompiler d'autre. Visite chaque pièce une fois au début.
2. **Serveur** : `preview_start` avec le nom `dev` (port 5173) ; s'il est refusé, relance-le. **Navigateur** : la page isolée de chrome-devtools (jamais les onglets de l'utilisateur), `emulate` en `1440x900x2` ; mobile : `390x844x2,mobile,touch`, puis **remets** `1440x900x2`.
3. **Le pont de développement `window.__lofi`** (absent du build) donne tout sans cliquer :
   - `__lofi.store` : le store (`getState().goto('market')`, `.toggle('wok')`, `.setState({ night: true })`, `.toggleNight()`, `.getState().muteAll()`).
   - `__lofi.three()` : `{ scene, gl, camera }` (`gl.info.render.calls`, `gl.info.programs.length`, parcours de `scene` pour inspecter des maillages).
   - `__lofi.audio` : `{ bus, getKit() }` pour mesurer les niveaux (étape 1.5), sans toucher au code.
4. **Sous WebGL logiciel (conteneur sans carte graphique), la page tourne à 2 ou 3 images par seconde** et les transitions plafonnent leur pas de temps : une capture prise 3 s après un changement de jour / nuit tombe au milieu du fondu. Attends des **images** (40 et plus), pas des secondes, et ne conclus rien sur une couleur tant que la transition n'est pas finie. Les animations simulées (neige, particules) se vérifient par le calcul à 60 images par seconde, pas sur la capture.
5. **Changer d'état en une seule commande, en attendant des images et non des secondes** (colle dans `evaluate_script`, adapte la ligne `await aller(...)`) :

```js
async () => {
  const frames = (n) => new Promise((res) => { let i = 0; const t = () => (++i >= n ? res() : requestAnimationFrame(t)); requestAnimationFrame(t) })
  const st = window.__lofi.store
  const aller = async (room, { night = false, on = [] } = {}) => {
    if (st.getState().room !== room) { st.getState().goto(room); while (st.getState().room !== room || st.getState().leaving) await frames(1) }
    if (st.getState().night !== night) st.getState().toggleNight()
    st.getState().muteAll()
    for (const target of on) st.getState().toggle(target) // les sons de la pièce : 'sizzle', 'simmer', 'rain'…
    await frames(40)
  }
  await aller('market', { night: true, on: ['sizzle', 'simmer', 'neon', 'radio'] })
  return { room: st.getState().room, calls: window.__lofi.three().gl.info.render.calls }
}
```

   À froid (page neuve) : `http://localhost:5173/?room=market&mix=sizzle.70,simmer.70&night=1&go` ouvre la pièce, de nuit, sons choisis (`go` n'existe qu'en développement). Pour attendre la fin du chargement : `while (document.getElementById('splash')) await frames(2)`.
6. **Recadrer en une fois** : `take_screenshot` (2880×1800), puis **une seule planche** avec tous les objets :

```bash
bash .claude/skills/audit-room/sheet.sh capture.png planche.png "x y w h" "x y w h" "x y w h" "x y w h"
```

   Chaque zone est ramenée à 640 px de large, deux par ligne : on lit **une** image au lieu de quatre. (`bash .claude/skills/audit-room/zoom.sh in out w h x y [largeur]` recadre une seule zone en grand quand un détail demande plus.) Les coordonnées sont celles de la capture : le point affiché sur l'écran × 1,44.
7. Boutons, si tu dois cliquer quand même : `[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Marché de nuit').click()` ; les objets ont un `aria-label` qui commence par leur libellé.

## Étape 1 — Contrôles mécaniques (rien à regarder, tout à mesurer)

Lance-les tous, note les chiffres.

1. **Types et build** : `npx tsc --noEmit -p .` puis `npm run build`. Zéro erreur.
2. **Console** : `list_console_messages` (erreurs et avertissements) après avoir allumé **tous** les sons de la pièce, la nuit. Rien.
3. **Appels de dessin** (budget : les pièces existantes font 150 à 290 ; au-delà de ~320 on explique pourquoi). Vite fait : `__lofi.three().gl.info.render.calls` (une passe). Les chiffres de `docs/ROOMS.md` comptent toutes les passes (ombres comprises) : pour les comparer, colle dans `evaluate_script` :

```js
async () => {
  const P = WebGL2RenderingContext.prototype
  window.__cnt = { n: 0 }
  for (const nm of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) { const o = P[nm]; P[nm] = function (...a) { window.__cnt.n++; return o.apply(this, a) } }
  const measure = async () => { let f = 0; window.__cnt.n = 0; await new Promise((res) => { const t = () => (++f >= 60 ? res() : requestAnimationFrame(t)); requestAnimationFrame(t) }); return Math.round(window.__cnt.n / 60) }
  return { auRepos: await measure() } // allume ensuite tous les sons et mesure encore
}
```

   Où va le budget : **un sprite compte** (chaque particule de vapeur vivante, chaque halo), un maillage qui projette une ombre compte deux fois, un objet cliquable (`userData.id`) ou animé (`LIVE`) n'est pas fusionné par `<Static>`. Remède : espacer les émetteurs `Steam` (`every` ≥ 1 s pour un détail), imbriquer un `<Static>` dans les groupes animés pour fusionner ce qui ne bouge pas (voir `market/Chef.tsx`), partager le matériau d'une série d'ampoules.
4. **Lumières ponctuelles** : `grep -rn "<pointLight\|<Flames" src/scene/<pièce>/` : au plus **3** par pièce.
5. **Niveaux sonores** (si la pièce a de nouveaux sons) : avec `window.__lofi.audio` (`bus` : un `GainNode` par `pièce/son`, `getKit().ctx`), pour chaque son : `toggle` du son, attends 1 s qu'il se construise, branche un `AnalyserNode` sur `bus['pièce/son']`, mesure le RMS et la crête sur 6 à 45 s (les évènements espacés demandent plus), éteins-le. Cibles : fonds continus entre **−28 et −32 dB** RMS, évènements ponctuels à **−10 dB** de crête, radio ≈ −15 à −20 dB RMS (elle se règle par le `level` des stations, `docs/RADIO.md`). Règle le gain avec `base` dans `CHANNELS` (`engine.ts`).
6. **Objets qui se traversent ou se collent** (le contrôle qui manquait : il aurait attrapé le vélo dans le distributeur, la poubelle dans le distributeur, le banc contre la télé). Colle dans `evaluate_script` ; il compare la boîte de chaque composant de la pièce avec celle des autres :

Lis `.claude/skills/audit-room/overlaps.js`, colle-le dans `evaluate_script` (pièce affichée) ou, sans navigateur outillé, passe-le à `page.evaluate` (voir `capture.mjs`) : il compare la boîte de chaque composant de la pièce avec celle des autres.

   Il doit trouver plusieurs dizaines de composants : une liste vide sur une pièce garnie veut dire qu'il a pris la mauvaise racine (pas « aucun défaut »). Les boîtes d'un `Batch` (bourrelet de neige, pyramide de boules) sont gonflées : écarte leurs faux positifs à l'œil.
   Lis chaque ligne : les coordonnées `ca` / `cb` disent où regarder. Un chevauchement voulu (un objet posé sur une table, une guirlande qui court au-dessus) se justifie ; tout le reste se déplace d'au moins 0,15. Ce n'est pas tout : un objet peut traverser **le mur ou le sol** (non testé ici) et une guirlande peut passer devant la face d'un distributeur (à vérifier à l'œil).
7. **Rien ne tombe dans un lieu couvert** : pluie, gouttes, flocons, ronds dans l'eau n'existent qu'à l'extérieur (baie, autour du diorama, nuage).
8. **Faces superposées : ce qui clignote** (remarque du propriétaire, 2026-11-11 : ponton, haut du mur de la laverie, façade et brique du café, qui « clignotaient »). Deux surfaces au même plan se disputent le pixel ; sur une capture fixe on ne voit presque rien, mais la pièce flotte et tourne, et le clignotement apparaît. Mesure-le au lieu de le chercher à l'œil : lis `.claude/skills/audit-room/coplanar.js`, colle-le dans `evaluate_script` (pièce affichée), il rend les paires de boîtes dont une face visible (+x, +y, +z) est au même plan à 0,008 près, par surface décroissante, avec les deux boîtes (`A`, `B`). Lis les 10 premières : un faux positif est une pièce inclinée (un pan de toit) ou une boîte qui en contient une autre sans que leurs faces se voient ; le reste est à corriger. Les cas réels trouvés jusqu'ici :
   - **deux planchers superposés** (le débarcadère et le ponton de la plage, planches dans deux sens) : l'un s'arrête au bord de l'autre, jamais dessous ;
   - **un chant ou un bandeau à la hauteur du biseau du mur** (le haut du mur de la laverie : chant à 4,33, biseau jusqu'à 4,36) : pose-le au-dessus du biseau et plus large que le mur ;
   - **deux boîtes voisines dont les faces de côté se recouvrent** (façade de grès et mur de brique d'un angle, redents du pignon et façade) : raccourcis l'une de 0,03, ou fais dépasser l'autre de 0,03 ;
   - **un dessus posé à 0,002 d'un autre** (les planches du ponton sur leur poutre) : au moins 0,012 d'écart.
   Après correction, relance le détecteur : les chiffres du haut de la liste doivent avoir disparu.
9. **Triangles par image** (le budget des tracés ne les compte pas) : `__lofi.three().gl.info.render.triangles`, après 5 s. Les 15 pièces font aujourd'hui 110 000 à 540 000 ; au-delà de 600 000 on cherche la série coupable (`Batch` de centaines de copies, sphères `SPH` de 1 344 triangles sur des formes minuscules) ; le test de fumée (`npm run test:smoke`) les affiche par pièce et échoue au-dessus de 1 000 000. `Part` et `Batch` prennent déjà `SPH_MID` / `SPH_LO` pour les petites formes ; une sphère passée à la main (`<mesh geometry={SPH}>`) n'est pas réduite.

## Étape 2 — Scan du code (les pièges connus)

Dans le dossier de la pièce, cherche et corrige :

| Recherche | Pourquoi |
|---|---|
| `rbox` + une texture (`map:`) sur le même matériau | `rbox` n'affiche que le centre d'une texture : affiches, menus, enseignes vont sur un `planeGeometry` ; tapis et parquets sur un plan ou `worldUV`. |
| `userData={{ id` sans `position=` au pied de l'objet | le rebond de clic (`useSquash`) fait glisser l'objet. |
| `sin(t * ` avec une fréquence qui change | animation qui saute : additionne la phase. |
| des `Part` à `y` identique (disque dans un cylindre, volet sur une boîte) | grésillement : décale de 0,005 à 0,015. |
| un `userData={LIVE}` qui contient des dizaines de `Part` immobiles | appels de dessin : `<Static>` imbriqué. |
| `Math.random()` dans le rendu | le décor change à chaque rendu : `seeded` ou `useMemo`. |
| une primitive nue pour une chose connue (sphères = feuillage, cylindre vert = bouteille) | « objet pas assez travaillé » : voir la grille de l'étape 4. |
| un panneau, un tiroir ou un volet dont la face est au même plan que celle du meuble (`z` du panneau + moitié de profondeur = `z` du caisson + moitié) | grésillement visible dès le premier gros plan (le tiroir de la télé) : fais-le dépasser de 0,02 à 0,03. |
| un accessoire (porte-bagages, sac, anse, auvent) dont la boîte touche un voisin | « objet qui entre dans un autre » : lance le détecteur de l'étape 1.6 et garde 0,15 de jeu entre deux objets posés au sol. |
| un objet de départ du décor passé sous un autre (tuyau, câble qui traverse un meuble) | un tuyau de gaz qui traversait le distributeur passait pour une pièce du vélo : fais courir tuyaux et câbles en dehors des meubles. |
| un canal audio qui planifie des évènements ponctuels (`scheduled` avec des coups, des « tic », des éclaboussures) pour un son qui doit rester de fond | fatigue en boucle : un son de base est continu et doux. Retire les bruitages de détail, ou passe l'objet en décor (remarque du propriétaire, 2026-11-07). |
| `new …Material` dans un composant rendu plusieurs fois | une matière par instance empêche la fusion et coûte des tracés. |
| un `ref` animé (`useBeat`, `useFrame`) qui écrit `position.y = …` (ou `.x`, `.z`) sur un groupe qui a déjà une position dans le JSX | l'écriture **remplace** la position : les touches de l'orgue étaient retombées au sol. Écris `BASE + décalage`, avec une constante partagée. |
| une inclinaison de pieds (`rotation={[sin a, 0, -cos a]}`) | signe inversé = pieds qui convergent vers le bas, tabouret « pas droit ». Pour un évasement : `[-sin a·k, 0, cos a·k]` ; vérifie de face que le pied touche le sol plus loin du centre que son sommet. |
| des boutons, manettes ou voyants placés à moins de 0,05 du bord d'une lunette, d'un écran ou d'un cadran | « boutons qui touchent l'écran » : mesure le bord bas de l'écran (`centre − rayon extérieur`) et garde 0,05 de jeu avant la rangée de commandes. Si le panneau est incliné et sort d'un coffre, vérifie aussi que la rangée du bas n'est pas enterrée dans le dessus du coffre. |
| de l'eau ou du verre transparent (`transparent: true`) qui contient des bulles, poissons, particules | l'écriture de profondeur de l'eau ou du verre cache ce qui est dedans. Matériau du contenant en `depthWrite: false`, contenu en `renderOrder` plus grand ; teinte de l'eau assez différente du mur derrière, sinon elle se lit comme du verre vide. |
| `cyl(…).translate(` / `.rotate…(` / `.scale(` / `.applyMatrix4(` sur une géométrie de `parts.tsx` (`cyl`, `rbox`, `worldUV`, `SPH`) | ces géométries sont **partagées et mises en cache** : la transformer sur place la change pour tout le monde, et une seconde fois à chaque retour dans la pièce (le cône du projecteur du sous-marin finissait dressé dans l'eau : « pourquoi de la lumière dans l'eau ? », 2026-11-11). Toujours `.clone()` d'abord. Recherche : `grep -rnE "(cyl|rbox|worldUV)\([^)]*\)\.(translate|rotate|scale|applyMatrix4|center)" src/scene`. |
| un faisceau, un halo ou un rayon qui ne part pas d'une source visible | « de la lumière dans l'eau » : un faisceau naît à la lentille (bout étroit) et s'élargit vers ce qu'il éclaire ; capture de nuit, de face et de côté. |
| `blob([...], { h })` dont un rayon (le plus petit des trois) est inférieur à `h` | le maillage a un pas de `h` : une aile ou une oreille plus fine que lui se découpe en morceaux détachés du corps (les mouettes en vol : « oiseau sans ailes », 2026-11-11). Garde chaque rayon à 1,2 × `h` au moins, ou baisse `h` (le calcul n'est fait qu'une fois). Regarde l'oiseau de face et de dessus, jamais seulement de profil. |
| un dessin sur canvas avec une aide qui convertit un rayon (`R(r)`) dans une texture plus haute que large (ou l'inverse) | l'échelle n'est pas la même en x et en y : un rayon vertical se convertit avec la hauteur (`TEX_H`), pas la largeur. Le masque crème des manchots montait jusqu'en haut du crâne (« chauves », 2026-11-11). |
| un grand aplat blanc, ou un blanc pur éclairé (`color: 0xffffff` avec un `emissive` d'intensité > 0,12 le jour) | « trop blanc, ça fait mal aux yeux » (les nuages de la chambre, 2026-11-11) : un nuage, de la neige ou un mur n'est jamais 255 ; vise 0xf0 à 0xf4 teinté vers l'ambiance, et une émission de 0,1 au plus (le jour, la nuit remonte la sienne). Mesure : aucun grand aplat à plus de 250 sur la capture. |
| une haie, une rangée d'arbustes, une clôture faite d'**une seule boîte** (`rbox` de plusieurs mètres) | une haie lisse se lit comme un boudin (« un long buisson, pas un tronc », 2026-11-11) : un cœur bas et une rangée de buis (`Foliage` `clipped`, tailles et rotations qui varient). |
| un lampadaire, un poteau, un banc dont `[x, z]` tombe dans le rectangle d'une haie, d'une boule de buis, d'un arbre ou d'un autre objet du dehors | « ça traverse le lampadaire » : liste les positions des deux familles dans le fichier et vérifie 0,3 de jeu au moins (les `LAMPS`, `HEDGES` et `BALLS` de la serre se croisaient). Le détecteur de l'étape 1.6 ne regarde que la pièce, pas le dehors. |
| deux **planchers**, deux dalles ou deux dessus de la même matière dans un même lieu (un quai et un ponton, un trottoir et une terrasse) | ils se recouvrent et clignotent : un seul des deux porte la jonction (étape 1.8). |
| un cône de lumière (faisceau de phare, projecteur, halo en cône : `CylinderGeometry`) | `CylinderGeometry(rayonHaut, rayonBas, …)` : le **haut** est du côté +y. Après `rotateZ(-π/2)`, +y devient +x. Le bout **étroit** va à la source (la lanterne), le large au loin. Le phare avait le cône à l'envers. Vérifie en capture, de nuit, que la lumière s'élargit en s'éloignant. |
| du texte ou une enseigne dans une autre langue que celle du lieu (RAMEN, KARAOKE, BAR sur un marché japonais) | le décor contredit la pièce : kana et kanji pour un lieu japonais, l'écriture locale partout (enseignes, distributeurs, banderoles). |
| un décor posé dans un coin de la capture mais jamais visible (caché derrière un client, un meuble, une planche à repasser) | un objet qu'on ne voit pas coûte des tracés pour rien : recadre là où tu l'as posé, et déplace-le ou supprime-le s'il est masqué. Un décor haut (poteau, parasol) ne passe pas devant la fenêtre ou un objet interactif. |
| un matériau ou une texture qui dépend d'un `CanvasTexture` créé une seule fois, un rendu qui touche au moteur (`Stage.tsx`) | le retour sur l'onglet (ou l'écran rallumé) peut vider le contexte WebGL : le canvas se reconstruit (`ContextGuard` dans `Stage.tsx`). Après tout changement du moteur de rendu ou des textures, rejoue la perte de contexte (étape 3 bis, point 7). |

## Étape 3 — Le protocole visuel (obligatoire, c'est le cœur)

Pour **chaque objet interactif** (liste dans `src/rooms/<id>.ts`) **et chaque amas de décor** (mur par mur, coin par coin) :

1. Capture plein cadre de la pièce (jour, puis nuit, tous les sons allumés, pluie incluse si la pièce en a).
2. Recadre chaque objet avec `zoom.sh` (largeur 300 à 600 px de la capture, sortie 1100 px) et **regarde l'image**. Une capture par objet, pas une pour toute la pièce.
3. Pour chaque recadrage, réponds par écrit à ces questions :
   - Reconnaît-on ce que c'est sans l'étiquette ?
   - Grésille-t-il ? (deux surfaces coplanaires, arêtes en pointillés)
   - Une partie traverse-t-elle un volume plein (tige dans une planche, disque hors d'un bloc, plante dans un siège) ?
   - Est-il de face ou de dos ? posé au sol ou flottant ?
   - Le bouton (point blanc, jour) est-il sur son corps, et pas sur l'objet voisin ?
   - Quand il joue : chaque pièce mobile reste-t-elle à sa place (touches, pistons, aiguilles) ? Allume le son **puis** recadre, pas seulement à l'arrêt.
   - Les pieds, tiges et pieds de meuble sont-ils droits et symétriques vus de face ? Les commandes ont-elles du jeu autour de l'écran ou du cadran qu'elles entourent ?
   - Le contenu d'une chose transparente (bocal, tube, vitrine) se voit-il, et le contenant se lit-il comme plein ?
   - Que fait-il quand le son joue, et se voit-il ?
   - Clignote-t-il quand la pièce bouge ? Fais glisser la pièce (ou laisse-la flotter) et capture deux ou trois images : une jonction (angle de deux murs, quai contre ponton, chant contre mur, façade contre pilastre) qui change d'une image à l'autre est une face superposée (détecteur de l'étape 1.8).
   - Vu **d'en haut** (la caméra regarde à 38° vers le bas), le dessus est-il juste ? Dessus de tête d'un animal (le masque ne monte pas jusqu'au crâne), dessus d'un nuage, d'un meuble, d'un toit : on les voit presque autant que la façade.
   - Y a-t-il une surface aveuglante (nuages, neige, mur clair) ? Le blanc d'une grande surface reste sous 250.
4. Vue d'ensemble : y a-t-il au moins 0,15 de jeu visible entre deux objets voisins posés au sol (un banc collé à la télé, une poubelle contre un distributeur) ? Les objets sont-ils répartis (fond et devant, gauche et droite), ou entassés dans un coin ? Y a-t-il un grand vide plat (un mur, un sol) sans rien à regarder ?
5. Mobile (390 px, jour et nuit) : la pièce tient, les hotspots sont atteignables, le mixeur reste lisible.
6. Compare avec la plage et le toit-terrasse à la même échelle : si un objet fait pauvre à côté, il l'est.

Passe-t-on en revue **toute** la liste ? Si un objet n'a pas son recadrage, le rapport dit « non vu » et la pièce n'est pas finie.

## Étape 3 bis — Le dehors et le fond (remarque du propriétaire, 2026-11-07)

La pièce n'est pas seule : ce qu'on voit autour doit **lui appartenir** et **ne jamais laisser de vide**. Le propriétaire a relevé « l'arrière est vide » (toit-terrasse, atelier, laverie) et « le dehors du marché ne match pas la room ». À faire sur la capture **plein écran**, pas sur un recadrage de la pièce :

1. **Le fond n'est pas vide.** La caméra regarde depuis +x, +z : « derrière » la pièce, c'est le **haut de l'écran** (directions -x et -z). Cherche tout aplat de ciel plus grand qu'un quart de la pièce, au-dessus et sur les côtés. Si tu en trouves, pose des volumes derrière (immeubles, toits, tours, arbres, collines, vagues, rochers selon le lieu), de plus en plus hauts en s'éloignant pour qu'ils dépassent au-dessus du mur du fond. Rappel de projection : plus un objet est loin derrière, plus il monte à l'écran (à hauteur égale, un objet à 8 de distance derrière le mur du fond est caché par ce mur s'il est plus bas que lui).
2. **Il reste visible.** `skyFade` efface un objet entre `r0` (≈ 7,5) et `r1` (≈ 12,5) de distance au centre : les volumes du fond se posent avec leur face proche à 5 à 10 du centre, sinon ils disparaissent et le fond redevient vide. Vérifie en capture, pas à la lecture du code.
3. **Même lieu, même ambiance, même culture.** Le dehors reprend les matières, les teintes et l'architecture de l'intérieur : un marché japonais sombre et mouillé a dehors des immeubles de béton sombres aux fenêtres chaudes, des enseignes en kana et kanji, des distributeurs, des lanternes, des fils électriques, de la street food (étals de takoyaki, yakitori, taiyaki, oden), pas une rue de brique européenne ni du lettrage latin. Un toit-terrasse new-yorkais a dehors des toits de brique **plus bas que nous** et une ville de tours de la même famille que celles de la pièce, pas de gros blocs plus hauts qu'elle qui l'écrasent. Question à poser : « si je ne voyais que le dehors, saurais-je de quelle pièce il vient ? ».
3 bis. **Même échelle.** Le dehors continue ce que la pièce montre déjà, à la même taille : si la pièce a de petites tours (≈ 1 m de large, 2 à 5 de haut), le dehors est fait de petites tours, pas de grandes (remarque du propriétaire sur le toit, 2026-11-07). Compare la largeur d'une fenêtre, d'un étage, d'un arbre ou d'une vague du dehors à celle de la pièce, côte à côte sur la capture : si l'écart se voit, refais le dehors à l'échelle de la pièce.
3 ter. **Le bon endroit, reconnaissable.** Le dehors doit dire *où* on est, pas « une ville » : un toit de New York a de la brique et de la pierre, des châteaux d'eau de bois sur presque chaque toit, une cheminée de vapeur rayée, des escaliers de secours, des gradins et des couronnes Art déco, et deux ou trois repères (flèche à gradins, couronne d'acier), avec des vides entre les tours. Une grille serrée de tours identiques à petites fenêtres bleutées se lit comme une mégalopole chinoise (remarque du propriétaire, 2026-11-07). Question : « un habitant de cette ville reconnaît-il le lieu ? ». Matières, proportions, matériel de toit et repères viennent du lieu réel : cherche des références avant de dessiner.
3 quater. **Tous les côtés du fond.** Vérifie les **quatre coins du haut de l'écran** et pas seulement le centre : « derrière » la pièce, c'est le haut, mais le haut gauche (direction -x) et le haut droit (direction -z) se remplissent à part. Remplir le fond du milieu en laissant le haut gauche vide est un défaut (le toit, 2026-11-07) : prolonge le décor le long de chaque côté, à 5 à 12 du centre.
4. **Pas de grand pan plat.** Un toit voisin ou un mur lointain sans rien dessus (ni matériel, ni fenêtres, ni enseigne) fait vide : habille-le (citernes, climatiseurs, cheminées, antennes) comme l'intérieur.
5. **L'activité autour.** Si la pièce est un lieu de vie (marché, café, laverie), le dehors montre ce qui s'y passe : étals éclairés, vitrines, passants, véhicules, lanternes. Un décor mort autour d'un lieu vivant se lit comme un fond d'écran.
5 bis. **Le fondu ne délave pas, la nuit ne tombe pas au bleu uni** (revue graphique du 2026-11-11). `skyFade` (`src/scene/outdoor.ts`) garde le décor franc près de la pièce (fondu en puissance 1,6) et donne au dehors un gain de lune la nuit, **uniquement sur ce qui est sombre** (`NIGHT_GAIN` et un voile froid, modulés par la luminance : à plein gain, la neige de la cabane virait au violet lumineux et le sable de la plage grisonnait) : sur la capture de jour, les volumes à 6 ou 7 du centre ont encore leur teinte ; sur celle de nuit, on distingue les volumes du dehors les uns des autres. Si une pièce garde un dehors laiteux de jour ou en aplat de nuit, c'est son `r0` / `r1` ou ses teintes, pas le moteur.
6. **Jour, nuit, pluie.** Les fenêtres et enseignes du dehors s'allument le soir (`emissiveMap`, animés avec `mood.night`), les volumes se fondent dans le ciel sans couture.
7. **Retour sur l'onglet.** Après un changement du rendu ou des textures : dans le navigateur, `getContext('webgl2').getExtension('WEBGL_lose_context')` puis `loseContext()`, attends 1 s, `restoreContext()`, attends 8 s et recadre : la pièce doit réapparaître entière (jamais de textures noires). Le garde est dans `src/scene/Stage.tsx` (`ContextGuard`).

## Étape 4 — La grille de profondeur (0 / 1 / 2 par ligne)

Note la pièce. Une ligne à 0 est à refaire avant de conclure ; viser un total d'au moins 80 %.

| Critère | 2 = au niveau plage / toit |
|---|---|
| Silhouette | chaque objet se reconnaît de loin et de près, forme propre, pas un amas de boules |
| Détails par objet | au moins 3 formes distinctes + une matière variée (une bouteille : corps, épaule, goulot, capsule ; une plante : pot + terre + vraies feuilles `Leaf`/`Fern`/`Foliage` ; une caisse : planches, poignées, contenu) |
| Textures | toutes les grandes surfaces (sol, murs, tissus) ont une texture ou un motif, jamais un aplat |
| Matières | brillant et mat différenciés, un matériau par usage, palette propre à la pièce |
| Lumière | une source chaude ou froide qui raconte la pièce (3 au plus), halos, reflets cohérents |
| Signature | au moins une chose qui bouge et n'existe nulle part ailleurs (tram, baleine, faisceau, vapeur) |
| Vie | un animal, un personnage ou un reflet de présence humaine, **modelé** : un chat a des oreilles qui se voient, un plastron, des pattes, une queue continue ; un client a des épaules, des bras, des mains. Un cylindre surmonté d'une boule (quille) = 0. Un visage d'animal qui « fait casque » = 1 au plus |
| Accessoires | chaque objet a sa trace d'usage et un accessoire voisin qui raconte quelqu'un (voir « Pas assez abouti » ci-dessous) ; l'extérieur visible de la pièce est habillé |
| Cadre | murs habillés (affiches, enseignes, tuyaux), pas de grand pan nu, rien d'entassé |
| Dehors et fond | rien de vide derrière la pièce, un dehors du même lieu et de la même culture que l'intérieur (étape 3 bis), qui s'allume le soir et montre l'activité autour |
| Objet de musique | propre à la pièce, avec `useBeat`, son libellé et son id `radio` |
| Sons | chaque objet interactif pilote un **son qu'on a envie d'écouter** (pas un bourdonnement, une chaudière ou un grésillement : « une personne le lance-t-elle exprès pour se détendre ? »), un **son de base** continu, doux et familier, cohérent avec la pièce et agréable en fond une heure (jamais un bruitage de détail : glaçons, pièces, linge plié) ; enregistrement réutilisé quand il existe, sinon un son synthétisé continu provisoire (le propriétaire trouvera un enregistrement) ; dosé (étape 1) |
| Interface | `ui`, `light` et `sky` de la fiche propres à la pièce, jour **et** nuit |

Les objets du quotidien se refont au niveau de la plage : une théière a un ventre rond, un couvercle à bouton, un bec, une anse et un pied (pas deux cylindres) ; un gril a des pieds, une auge à rebords, des braises au fond, une grille ; un tiroir a sa poignée. Si on hésite à reconnaître l'objet sans étiquette, il est à 0.

**« Pas assez abouti » (remarque du propriétaire sur l'igloo, octobre 2026)** : une pièce peut avoir tous ses objets lisibles et rester pauvre. Pour chaque objet, vérifie ces quatre couches, dans l'ordre, et ajoute ce qui manque :

1. **La forme** : au moins 5 formes distinctes, pas 2 ou 3 (une radio : boîtier, coins de caoutchouc, façade, haut-parleur et sa bague, cadran, boutons, poignée, antenne, manivelle ; un thermos : corps, bague, bec, bandeau, anse).
2. **La matière** : au moins deux matières par objet (mat et brillant, bois et métal, laine et cuir), et une inscription quand l'objet en a dans la vraie vie : cadran gradué, pochoir sur une caisse, étiquette d'une boîte. Une inscription est une texture sur un **plan** (`planeGeometry`), jamais sur une `rbox`.
3. **L'usage** : l'objet montre qu'on s'en sert (le couvercle entrouvert sur la neige qui fond, la cuillère dans le quart, les éclats d'émail, le livre ouvert retourné sur le duvet).
4. **Le voisinage** : un accessoire posé à côté, qui raconte quelqu'un (les ciseaux près de la moufle, la boîte d'allumettes près du réchaud, la boussole sur l'appui de la fenêtre, l'écumoire près du trou de pêche).

Et autour des objets :
- **La pièce ne s'arrête pas à ses murs.** Si le socle déborde (une île, une terrasse, un quai), habille ce qui se voit dehors : un traîneau, des arbres, une lanterne, des traces de pas. Un anneau de neige nue « fait vide ».
- **Un visage d'animal** : le masque clair couvre tout le devant de la tête ; sinon la tête de couleur entoure le visage et se lit comme un casque (les manchots de l'igloo). Les yeux, les joues et le bec se posent sur le masque. **Mais le masque ne monte pas jusqu'au sommet du crâne** : vu d'en haut, l'animal paraît chauve (les manchots, 2026-11-11) ; le crâne garde une calotte de la couleur du pelage.
- **Les fils fins disparaissent** : une ligne de pêche, un laçage, un fil de couture sous 0,008 de rayon ne se voit plus à l'échelle de la pièce. Grossis-le (0,009 et plus), donne-lui une couleur qui tranche, ou serre le motif.
- **Un cadre de neige ou de pierre autour d'une ouverture** prend la teinte de la paroi : blanc vif en relief, il se lit comme un meuble (deux colonnes).
- **Une pièce ronde ou voûtée** : le haut de la paroi du fond est caché à la caméra par la voûte. Calcule jusqu'où la paroi est visible (rayon vers la caméra, voir `docs/ROOMS.md`, igloo) avant d'y poser une fenêtre ou une étagère.
- **Un objet qui bouge avec son son** suit le geste qu'on entend, au même instant : le canal appelle `pulse(ctx, id, t)` (`src/audio/events.ts`) et la scène lit `pulses[id]` (le thermos qui verse, l'aiguille qui pique, le rond dans l'eau).
- **Une couleur qui vire la nuit** (un rose qui devient violet sous la lumière bleue) : une petite lueur de sa propre couleur (`emissive` = la couleur, intensité 0,1 à 0,15).

Recettes à suivre, tirées des pièces de référence :
- Bouteille (`roof/Lounge.tsx`, `FrontCorner`) : cylindre pour le corps, sphère pour l'épaule, cylindre fin pour le goulot, petit cylindre doré pour la capsule.
- Plante (`beach/Plants.tsx`, `nature/`) : `Leaf` (ovale, cœur, lancéolée, pennée, fendue), `Fern`, `Foliage` (`clipped` pour un arbuste taillé), `Vines` pour les retombantes ; matériaux `leafy(…)` et `foliage(…)`. Jamais des sphères lisses.
- Pierre et rocaille : `Rock` ; planches : `rbox` en `worldUV`.

## Étape 5 — Le rapport (à coller dans la réponse finale)

```
Pièce : <nom>   Mode : jour + nuit, desktop + 390 px
Mesures : tsc ✓ / build ✓ / console ✓ — tracés : repos N, tout allumé M — triangles : T — lumières : k/3 — sons : tableau des niveaux
Faces superposées (étape 1.8) : N paires lues, corrigées / faux positifs (lesquels)
Objets vus en gros plan : <liste, un « vu » par objet, sinon « non vu »>
Défauts trouvés → corrigés : …
Défauts trouvés → restants (et pourquoi) : …
Dehors et fond (étape 3 bis) : fond sans aplat vide, quatre coins du haut vérifiés ✓ / dehors reconnaissable pour le lieu, à l'échelle de la pièce ✓ / dehors cohérent avec la pièce ✓ / perte de contexte rejouée ✓
Grille : total X / 26 — lignes à 0 : …
Références comparées : plage / toit — écart : …
```

Si l'utilisateur relève un défaut qui n'était pas dans la liste, corrige la cause (ici ou dans les briques partagées), puis **ajoute-le** à « Les défauts qui reviennent » dans `CLAUDE.md` et `docs/ROOMS.md`, et à cette page.
