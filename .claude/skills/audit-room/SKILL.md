---
name: audit-room
description: Audit d'une pièce de Chambre Lofi (nouvelle ou retravaillée) avant de dire qu'elle est finie. À lancer dès qu'on crée, refait ou retouche beaucoup une pièce, un objet ou une ambiance, ou quand l'utilisateur parle de bug de texture, d'objet qui scintille, qui traverse un autre, d'objet « pas assez travaillé » ou d'ambiance pas unique. Vérifie les bugs mécaniques (tracés, lumières, sons, ancres, interpénétrations), regarde chaque objet en gros plan, jour et nuit, mobile compris, et note la profondeur de travail par rapport à la plage et au toit-terrasse.
---

# Auditer une pièce de Chambre Lofi

Une pièce n'est **pas finie parce qu'elle compile**. Elle l'est quand chaque objet, vu en gros plan, se comprend et que la pièce a une ambiance qu'aucune autre n'a. Ce skill rend ça mécanique : on ne dit « fini » qu'avec le rapport de la dernière étape, rempli avec des **preuves** (captures recadrées, chiffres), pas des impressions.

Références de qualité : **la plage** (`src/scene/beach/`) et **le toit-terrasse** (`src/scene/roof/`). Ouvre-les avant de juger une autre pièce : c'est ce niveau de soin qu'on vise (bouteilles à épaule et capsule, plantes en vraies feuilles, lumières propres, vie qui bouge).

Règles de la maison à garder en tête : `CLAUDE.md` (« Le soin des ambiances ») et `docs/ROOMS.md` (« Les défauts qui reviennent »). Ne commite rien sans demande.

## Étape 0 — Préparer l'outillage (et aller vite)

Ce qui prend du temps dans les tests, par ordre : **recharger la page** (chaque pièce visitée recompile ses shaders : 20 à 30 s la première fois, 1,5 s ensuite), les attentes fixes (`sleep` de 3 s « au cas où »), cliquer bouton par bouton, et lire une capture par objet. Les règles :

1. **Une seule page, jamais de rechargement** sauf si tu as changé `store.ts`, `engine.ts` ou `main.tsx`. Le rechargement à chaud de Vite met à jour les scènes sans rien recompiler d'autre. Visite chaque pièce une fois au début.
2. **Serveur** : `preview_start` avec le nom `dev` (port 5173) ; s'il est refusé, relance-le. **Navigateur** : la page isolée de chrome-devtools (jamais les onglets de l'utilisateur), `emulate` en `1440x900x2` ; mobile : `390x844x2,mobile,touch`, puis **remets** `1440x900x2`.
3. **Le pont de développement `window.__lofi`** (absent du build) donne tout sans cliquer :
   - `__lofi.store` : le store (`getState().goto('market')`, `.toggle('wok')`, `.setState({ night: true })`, `.toggleNight()`, `.getState().muteAll()`).
   - `__lofi.three()` : `{ scene, gl, camera }` (`gl.info.render.calls`, `gl.info.programs.length`, parcours de `scene` pour inspecter des maillages).
   - `__lofi.audio` : `{ bus, getKit() }` pour mesurer les niveaux (étape 1.5), sans toucher au code.
4. **Changer d'état en une seule commande, en attendant des images et non des secondes** (colle dans `evaluate_script`, adapte la ligne `await aller(...)`) :

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
5. **Recadrer en une fois** : `take_screenshot` (2880×1800), puis **une seule planche** avec tous les objets :

```bash
bash .claude/skills/audit-room/sheet.sh capture.png planche.png "x y w h" "x y w h" "x y w h" "x y w h"
```

   Chaque zone est ramenée à 640 px de large, deux par ligne : on lit **une** image au lieu de quatre. (`scratchpad/zoom.sh in out w h x y [largeur]` recadre une seule zone en grand quand un détail demande plus.) Les coordonnées sont celles de la capture : le point affiché sur l'écran × 1,44. Si `zoom.sh` a disparu, recrée-le : `ffmpeg -y -loglevel error -i "$1" -vf "crop=$3:$4:$5:$6,scale=${7:-1100}:-1:flags=lanczos" "$2"`.
6. Boutons, si tu dois cliquer quand même : `[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Marché de nuit').click()` ; les objets ont un `aria-label` qui commence par leur libellé.

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
5. **Niveaux sonores** (si la pièce a de nouveaux sons) : avec `window.__lofi.audio` (`bus` : un `GainNode` par `pièce/son`, `getKit().ctx`), pour chaque son : `toggle` du son, attends 1 s qu'il se construise, branche un `AnalyserNode` sur `bus['pièce/son']`, mesure le RMS et la crête sur 6 à 45 s (les évènements espacés demandent plus), éteins-le. Cibles : fonds continus entre **−28 et −32 dB** RMS, évènements ponctuels à **−10 dB** de crête, radio ≈ −15 dB. Règle le gain avec `base` dans `CHANNELS` (`engine.ts`).
6. **Objets qui se traversent ou se collent** (le contrôle qui manquait : il aurait attrapé le vélo dans le distributeur, la poubelle dans le distributeur, le banc contre la télé). Colle dans `evaluate_script` ; il compare la boîte de chaque composant de la pièce avec celle des autres :

```js
async () => {
  const { scene } = window.__lofi.three(); const V = scene.position.constructor; scene.updateMatrixWorld(true)
  let best = null; scene.traverse((o) => { if (o.isGroup) { const n = o.children.filter((c) => c.isMesh && c.visible).length; if (!best || n > best.n) best = { o, n } } })
  const root = best.o, first = root.children.find((c) => c.isMesh); first.geometry.computeBoundingBox(); const Box = first.geometry.boundingBox.constructor, objs = []
  for (const g of root.children) {
    if (g.isMesh || g.isSprite || g.isLight) continue
    const box = new Box(); let n = 0
    g.traverse((m) => { if (!m.isMesh || !m.geometry) return; const mat = m.material; if (mat && (mat.blending === 2 || (mat.transparent && mat.opacity < 0.9))) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld); const s = bb.getSize(new V()); if (Math.max(s.x, s.y, s.z) > 4) return; box.union(bb); n++ })
    const s = box.getSize(new V()); if (!n || box.isEmpty() || (Math.max(s.x, s.y, s.z) > 2.5 && Math.min(s.x, s.y, s.z) < 0.15)) continue // les câbles et les tuyaux croisent tout : on les ignore
    objs.push({ id: g.userData.id || '#' + root.children.indexOf(g), box })
  }
  const out = []
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    const a = objs[i].box, b = objs[j].box
    const o = [Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y), Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z)]
    const gap = -Math.min(...o) // < 0 : ils se chevauchent ; entre 0 et 0,06 : ils se touchent
    const floor = a.min.y < 0.3 && b.min.y < 0.3 // deux objets posés au sol ne doivent ni se toucher ni se traverser
    if ((o.every((v) => v > 0.02)) || (floor && o[1] > 0 && gap < 0.06 && gap > -0.02)) out.push({ a: objs[i].id, b: objs[j].id, chevauche: o.map((v) => +v.toFixed(2)), ca: a.getCenter(new V()).toArray().map((v) => +v.toFixed(1)), cb: b.getCenter(new V()).toArray().map((v) => +v.toFixed(1)) })
  }
  return out.sort((p, q) => q.chevauche[0] * q.chevauche[1] * q.chevauche[2] - p.chevauche[0] * p.chevauche[1] * p.chevauche[2]).slice(0, 25)
}
```

   Lis chaque ligne : les coordonnées `ca` / `cb` disent où regarder. Un chevauchement voulu (un objet posé sur une table, une guirlande qui court au-dessus) se justifie ; tout le reste se déplace d'au moins 0,15. Ce n'est pas tout : un objet peut traverser **le mur ou le sol** (non testé ici) et une guirlande peut passer devant la face d'un distributeur (à vérifier à l'œil).
7. **Rien ne tombe dans un lieu couvert** : pluie, gouttes, flocons, ronds dans l'eau n'existent qu'à l'extérieur (baie, autour du diorama, nuage).

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
| `new …Material` dans un composant rendu plusieurs fois | une matière par instance empêche la fusion et coûte des tracés. |
| un `ref` animé (`useBeat`, `useFrame`) qui écrit `position.y = …` (ou `.x`, `.z`) sur un groupe qui a déjà une position dans le JSX | l'écriture **remplace** la position : les touches de l'orgue étaient retombées au sol. Écris `BASE + décalage`, avec une constante partagée. |
| une inclinaison de pieds (`rotation={[sin a, 0, -cos a]}`) | signe inversé = pieds qui convergent vers le bas, tabouret « pas droit ». Pour un évasement : `[-sin a·k, 0, cos a·k]` ; vérifie de face que le pied touche le sol plus loin du centre que son sommet. |
| des boutons, manettes ou voyants placés à moins de 0,05 du bord d'une lunette, d'un écran ou d'un cadran | « boutons qui touchent l'écran » : mesure le bord bas de l'écran (`centre − rayon extérieur`) et garde 0,05 de jeu avant la rangée de commandes. Si le panneau est incliné et sort d'un coffre, vérifie aussi que la rangée du bas n'est pas enterrée dans le dessus du coffre. |
| de l'eau ou du verre transparent (`transparent: true`) qui contient des bulles, poissons, particules | l'écriture de profondeur de l'eau ou du verre cache ce qui est dedans. Matériau du contenant en `depthWrite: false`, contenu en `renderOrder` plus grand ; teinte de l'eau assez différente du mur derrière, sinon elle se lit comme du verre vide. |

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
4. Vue d'ensemble : y a-t-il au moins 0,15 de jeu visible entre deux objets voisins posés au sol (un banc collé à la télé, une poubelle contre un distributeur) ? Les objets sont-ils répartis (fond et devant, gauche et droite), ou entassés dans un coin ? Y a-t-il un grand vide plat (un mur, un sol) sans rien à regarder ?
5. Mobile (390 px, jour et nuit) : la pièce tient, les hotspots sont atteignables, le mixeur reste lisible.
6. Compare avec la plage et le toit-terrasse à la même échelle : si un objet fait pauvre à côté, il l'est.

Passe-t-on en revue **toute** la liste ? Si un objet n'a pas son recadrage, le rapport dit « non vu » et la pièce n'est pas finie.

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
| Vie | un animal, un personnage ou un reflet de présence humaine, **modelé** : un chat a des oreilles qui se voient, un plastron, des pattes, une queue continue ; un client a des épaules, des bras, des mains. Un cylindre surmonté d'une boule (quille) = 0 |
| Cadre | murs habillés (affiches, enseignes, tuyaux), pas de grand pan nu, rien d'entassé |
| Objet de musique | propre à la pièce, avec `useBeat`, son libellé et son id `radio` |
| Sons | chaque objet interactif pilote un son propre à l'ambiance, dosé (étape 1) |
| Interface | `ui`, `light` et `sky` de la fiche propres à la pièce, jour **et** nuit |

Les objets du quotidien se refont au niveau de la plage : une théière a un ventre rond, un couvercle à bouton, un bec, une anse et un pied (pas deux cylindres) ; un gril a des pieds, une auge à rebords, des braises au fond, une grille ; un tiroir a sa poignée. Si on hésite à reconnaître l'objet sans étiquette, il est à 0.

Recettes à suivre, tirées des pièces de référence :
- Bouteille (`roof/Lounge.tsx`, `FrontCorner`) : cylindre pour le corps, sphère pour l'épaule, cylindre fin pour le goulot, petit cylindre doré pour la capsule.
- Plante (`beach/Plants.tsx`, `nature/`) : `Leaf` (ovale, cœur, lancéolée, pennée, fendue), `Fern`, `Foliage` (`clipped` pour un arbuste taillé), `Vines` pour les retombantes ; matériaux `leafy(…)` et `foliage(…)`. Jamais des sphères lisses.
- Pierre et rocaille : `Rock` ; planches : `rbox` en `worldUV`.

## Étape 5 — Le rapport (à coller dans la réponse finale)

```
Pièce : <nom>   Mode : jour + nuit, desktop + 390 px
Mesures : tsc ✓ / build ✓ / console ✓ — tracés : repos N, tout allumé M — lumières : k/3 — sons : tableau des niveaux
Objets vus en gros plan : <liste, un « vu » par objet, sinon « non vu »>
Défauts trouvés → corrigés : …
Défauts trouvés → restants (et pourquoi) : …
Grille : total X / 22 — lignes à 0 : …
Références comparées : plage / toit — écart : …
```

Si l'utilisateur relève un défaut qui n'était pas dans la liste, corrige la cause (ici ou dans les briques partagées), puis **ajoute-le** à « Les défauts qui reviennent » dans `CLAUDE.md` et `docs/ROOMS.md`, et à cette page.
