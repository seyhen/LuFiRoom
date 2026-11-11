---
name: review-rooms
description: Revue graphique d'ensemble de LufiRoom (les quinze pièces, jour et nuit, desktop et mobile) et de son rendu : lumière, fondu du dehors, nuit, cadrage, interface. À lancer quand l'utilisateur demande « une revue graphique », « ce que tu en penses », « comment améliorer le rendu », après un changement de moteur de rendu (Lights.tsx, outdoor.ts, materials.ts, Stage.tsx) ou avant une mise en ligne qui touche l'apparence. Ne remplace pas audit-room, qui juge une pièce en gros plan, objet par objet.
---

# Revue graphique d'ensemble

`audit-room` regarde **une** pièce de près. Ce skill regarde **toutes les pièces d'un coup d'œil**, pour voir ce qu'on ne voit pas pièce par pièce : une pièce en retrait par rapport aux autres, deux pièces qui se ressemblent, un défaut de moteur qui touche tout.

## 1. Capturer (une seule fois, 25 à 35 minutes en rendu logiciel)

```bash
npx vite --port 5173 &                                  # arrêter à la fin : pkill -f "vite --port"
D=<scratchpad>/revue
node .claude/skills/audit-room/capture.mjs $D           # 15 pièces, jour et nuit, 1440 × 900 : lance-le en arrière-plan
node .claude/skills/audit-room/capture.mjs $D/m bedroom,market,greenhouse,beach --mobile --once=d
for r in bedroom cabin cafe beach train roof atelier onsen lighthouse submarine market igloo treehouse laundromat greenhouse; do bash .claude/skills/audit-room/pair.sh $D $r; done
```

Un seul navigateur à la fois (deux font expirer les captures). Pour comparer un réglage de moteur : capture avant, change, capture après sur 2 ou 3 pièces représentatives (café et laverie pour la brume de jour, train et atelier pour la nuit, igloo pour le blanc), et recadre `avant | après` avec la même commande `hstack` que `pair.sh`.

## 2. Lire les planches (une image jour | nuit par pièce)

Pour chaque pièce, réponds aux sept questions, par écrit :

1. **Dehors de jour** : les volumes à 5-8 du centre gardent-ils leur teinte, ou sont-ils laiteux ? (`skyFade`, `r0` / `r1`.)
2. **Dehors de nuit** : distingue-t-on les volumes du dehors, ou un bleu uni ? (gain de lune de `skyFade`, teintes de la pièce.)
3. **Fond** : aplat de ciel dans l'un des quatre coins du haut ?
4. **Grands aplats** : sol, route, pelouse, toit sans motif ni objet ? Arbres en « sucettes » ?
5. **Identité** : cette pièce pourrait-elle être confondue avec une autre (même immeuble, même palette) ?
6. **Cadrage** : la pièce occupe-t-elle au moins la moitié de la largeur utile ? (`zoom` de la fiche.)
7. **Intérieur de nuit** : une lumière chaude qui raconte la pièce, sans coin noir ?

Puis classe les pièces en trois groupes (abouties, un point faible, en retrait) et trie les défauts **par effet**, en séparant ce qui est un réglage de moteur (touche tout) de ce qui est propre à une pièce.

## 3. Mobile et interface (4 pièces, 390 px)

La pièce tient-elle (bande vide au-dessus du mixeur) ? Les puces de pièces se lisent-elles (15 sur une ligne : seules 4 sont visibles) ? Les boutons de la barre du haut se distinguent-ils ? Rien ne passe sur les puces (étoiles de la chambre) ?

## 4. Rapport

Un tableau des pièces (groupe, point faible), la liste des défauts par ordre d'effet (moteur d'abord), ce qui n'a **pas** été vu (gros plans, sons, météo, animations : le rendu logiciel est à 1 image par seconde). Pas de modification sans demande ; propose l'ordre.
