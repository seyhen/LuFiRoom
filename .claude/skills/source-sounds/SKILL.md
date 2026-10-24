---
name: source-sounds
description: Trouver, télécharger, préparer et brancher un ou plusieurs sons enregistrés dans LufiRoom (ambiance, objet, musique de la radio). À lancer dès que l'utilisateur veut « un vrai son », remplacer un son synthétique, envoie des captures Pixabay, ou qu'un objet de room-objects attend son enregistrement. Couvre tout le parcours : liens de recherche, choix par capture, téléchargement par un agent avec Claude dans Chrome, découpe en WAV, encodage, déclaration, mode de lecture, mesure et réglage des niveaux, crédits.
---

# Sourcer un son, de la recherche au niveau juste

Le parcours complet, tel qu'il a marché sur une cinquantaine de sons. L'utilisateur **choisit** (par capture), on fait **tout le reste**. Règles : `CLAUDE.md` (« Sons », licences : CC0, ou Pixabay Content License accordée par le propriétaire ; toute autre licence se demande), skill `room-objects` pour le choix d'un objet.

## 1. Choisir le son : deux modes

**Mode A — l'utilisateur choisit.** Pour chaque son : 2 ou 3 liens de recherche (voir « Sources » plus bas) avec ce qu'il faut chercher (« un geste régulier, 20 à 60 s, sans voix ni musique ni coup isolé ») et ce qu'il faut éviter (ce qui frotte, râcle, broie ; les bips ; les échos énormes). Il renvoie **une capture par son** (titre, auteur, durée) ; note-les, ils servent à retrouver la bonne ligne.

**Mode B — candidats classés (par défaut quand l'utilisateur veut aller vite, ou ne choisit pas).** L'agent de téléchargement fait le tri, l'utilisateur ne tranche qu'entre 1 ou 2 finalistes.

1. L'agent ouvre la recherche (2 formulations par son) et relève pour chaque ligne : titre, auteur, durée, mots-clés, **nombre de likes** (Pixabay) ou **de téléchargements et note** (Freesound), forme d'onde.
2. Il retient **3 à 5 candidats** en classant d'abord par **pertinence** (les mots-clés du titre et des tags correspondent au son voulu ; durée entre 15 et 90 s ; forme d'onde régulière, sans pic isolé énorme, sans grand vide), puis par **popularité** (le plus de likes ou de téléchargements) à pertinence comparable. Un son très aimé mais hors sujet (musique, voix, autre objet) est écarté.
3. Il télécharge les candidats (étape 2), sans les convertir encore.
4. Mesure : `node .claude/skills/source-sounds/analyze-sound.cjs [--geste] <mp3…>` (`--geste` pour un geste ou un évènement espacé : cartes, pinceau, goutte ; sans l'option pour un fond continu). Le script écarte les sons stridents, à coups isolés ou troués, et affiche durée, sonie, aigus, silence. **Il ne juge pas le plaisir d'écoute.**
5. Il classe : aucune alerte d'abord, puis pertinence, puis popularité. Rapport à l'utilisateur : **1 ou 2 finalistes par son**, avec titre, auteur, durée, likes, chiffres de l'analyse et capture de la ligne, et le candidat écarté avec la raison. L'utilisateur confirme (c'est lui qui entend). Ensuite seulement : conversion et suite.

Dans les deux modes, un son que l'utilisateur refuse va dans « Idées écartées » de `room-objects`.

## Sources (libres de droits)

| Source | Licence à exiger | Notes |
|---|---|---|
| **Pixabay** (`pixabay.com/sound-effects/search/<mots>/`) | Pixabay Content License (accordée par le propriétaire pour ce projet) | La source principale ; beaucoup de pistes y viennent de Freesound. |
| **Freesound** (`freesound.org/search/?q=<mots>&f=license:"Creative Commons 0"`) | **CC0 uniquement** (filtre à mettre dans l'adresse) | Le plus grand choix. Jamais CC-BY (il faudrait citer l'auteur dans l'app) ni CC-BY-NC (usage commercial interdit). Téléchargement avec compte gratuit. |
| **Mixkit** (`mixkit.co/free-sound-effects/`) | Mixkit License (usage libre, sans attribution) | Petite bibliothèque, qualité régulière, sans compte. |

À ne **pas** utiliser sans demander : BBC Sound Effects (usage personnel ou éducatif seulement), Zapsplat (conditions à lire), tout site qui exige une attribution ou interdit le commercial. Les licences changent : relis-les au moment du téléchargement, et note la source et la licence dans `CREDITS.md`. Toute licence autre que celles de ce tableau se demande d'abord à l'utilisateur (CLAUDE.md).

## 2. Télécharger (agent + Claude dans Chrome)

Délègue à un agent en arrière-plan (`Agent`, `general-purpose`) avec un prompt autonome qui contient : soit la liste « titre exact · auteur · durée → `audio-src/<pièce>/<son>.wav` » (mode A), soit les sons voulus avec leurs mots-clés (mode B : l'agent classe, télécharge les candidats dans `Téléchargements/candidats/<son>/` et rapporte), et la méthode qui marche :

- outils `mcp__claude-in-chrome__*` (ToolSearch `select:` en une fois) ; `tabs_context_mcp {createIfEmpty:true}` ;
- naviguer vers la recherche du **titre exact**, attendre 3 s, puis **toujours un `computer zoom`** de `[0,340,1488,700]` avant de cliquer (sinon le clic après une navigation est perdu) ;
- repérer la ligne au titre, à l'auteur **et** à la durée (pas forcément la 1re) ; bouton de téléchargement à x≈1382, y≈372 / 438 / 506 / 577 pour les lignes 1 à 4 (écran 1488×812) ;
- un clic par page, puis **6 à 10 s d'attente** (fenêtre « Nice one! », fichier en retard ; si l'onglet se fige, refaire un zoom puis recliquer) ; vérifier l'arrivée dans `Téléchargements` (`ls -t`) : `<auteur>-<titre>-<id>.mp3` ;
- préparer : `ffmpeg -y -i <mp3> -ss <début> -t 60 -ac 1 -ar 48000 audio-src/<pièce>/<son>.wav` (mono pour un objet, stéréo `-ac 2` pour une grande ambiance ; 60 s au plus : un son décodé reste en mémoire) ; copier le mp3 dans `Téléchargements/pixabay-sources/` ;
- **ne pas lancer `npm run audio`** si un autre agent travaille dans le dépôt ; rapporter le nom exact du mp3 (son id Pixabay sert aux crédits) et la durée du WAV.

La musique de la radio est l'exception : morceaux entiers, stéréo, copiés tels quels (`audio-src/radio/<slug>.m4a`), lus en flux (pas de limite de 60 s).

## 3. Encoder et déclarer

1. `npm run audio` (une seule fois, quand tous les WAV sont là) : −20 LUFS, Opus/WebM + MP3 dans `public/audio/<pièce>/`.
2. Dans `src/rooms/<pièce>.ts`, `loops` : `<son>: { src: 'audio/<pièce>/<son>', gain: 0.8 }`. Un fichier partagé entre pièces est déclaré par son chemin d'origine (pas de copie).
3. Le **mode de lecture** dans le canal `src/audio/channels/<son>.ts` (toujours avec une synthèse de repli) :

| Le son | Lecture | Réglages de départ |
|---|---|---|
| fond continu sans motif (pluie, vent, eau, souffle, moteur) | `kit.loopOrChannel` | — |
| geste qui reviendrait à l'identique en boucle, ou fichier court (< 15 s) | `kit.grainsOr` | `len` 1/3 à 1/2 de la durée, `fade` 0,4 à 1,5 s, `rate` 0,02 à 0,07, `level` 0,15 à 0,2 |
| évènement espacé (corne, pigeon, goutte) | `kit.shotsOr` | `gap` de quelques secondes à 30 s, `rate` 0,04 à 0,08 |
| morceau de musique | `playlist` de la pièce (`src/rooms/playlist.ts`), avec `bpm` et `beat` mesurés | — |

Pour la radio, mesure le tempo et le premier temps (analyse du signal : flux spectral + peigne de tempo 58 à 120 bpm) plutôt que de les deviner.

## 4. Mesurer et régler le niveau

Serveur de dev, page de test (`audit-room`, étape 0), puis dans `evaluate_script` :

```js
async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  while (!window.__lofi || document.getElementById('splash')) await sleep(300)
  const st = window.__lofi.store, A = window.__lofi.audio
  const m = async (room, id, secs = 10) => {
    if (st.getState().room !== room) { st.getState().goto(room); while (st.getState().room !== room || st.getState().leaving) await sleep(100) }
    st.getState().muteAll(); st.getState().toggle(id); await sleep(1500)
    const bus = A.bus[`${room}/${id}`], an = A.getKit().ctx.createAnalyser(); an.fftSize = 2048; bus.connect(an)
    const b = new Float32Array(2048); let sum = 0, n = 0, pk = 0
    const end = performance.now() + secs * 1000
    while (performance.now() < end) { an.getFloatTimeDomainData(b); for (const v of b) { sum += v * v; n++; pk = Math.max(pk, Math.abs(v)) } await sleep(40) }
    bus.disconnect(an); st.getState().toggle(id)
    return `${room}/${id} ${(10 * Math.log10(sum / n)).toFixed(1)} dB RMS / ${(20 * Math.log10(pk)).toFixed(1)} dB crête`
  }
  return [await m('cafe', 'drip', 20)] // une ligne par son ; 6 à 12 s pour un fond, 20 à 30 s pour des évènements
}
```

Cibles : **fond continu −28 à −32 dB RMS** ; **évènement ou geste ponctuel ≈ −10 dB de crête** ; radio ≈ −20 dB RMS. Corrige avec `base` dans `CHANNELS` (`src/audio/engine.ts`) : écart en dB → facteur `10^(dB/20)`. Un fichier qui sort trop fort d'un coup se règle là, pas en retouchant le WAV. Un seul `evaluate_script` ne doit pas dépasser ~60 s (sinon il expire) : mesure par lots.

Puis écoute **avec les autres sons de la pièce** (le préréglage « travailler » par exemple) : le nouveau ne couvre rien.

## 5. Créditer

`public/audio/CREDITS.md`, une ligne par fichier : `| <pièce>/<son> | <titre> | <auteur> | <id Pixabay> |` sous une section datée (« Boucles ajoutées le AAAA-MM-JJ (…) »), en rappelant la licence et la provenance. Pour un fichier fourni par l'utilisateur (sa musique), « licence à confirmer » tant qu'il ne l'a pas précisée. Le skill `release-check` vérifie qu'aucun fichier n'est sans crédit.

## 6. Fin

`npx tsc --noEmit -p .`, `npm run build`, console vide (pas de « Enregistrement indisponible »). Rapport à l'utilisateur : ce qui est branché, les niveaux mesurés, ce qui reste synthétisé. Commit seulement sur demande.
