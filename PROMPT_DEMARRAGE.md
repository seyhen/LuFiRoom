# Premier prompt pour Claude Code

Dans ce dossier, lance Claude Code en mode plan : il lit et propose un plan, sans modifier aucun fichier tant que tu n'as pas validé.

```
claude --permission-mode plan
```

(Si Claude Code tourne déjà : Maj+Tab jusqu'à voir `⏸ plan mode on` en bas.)

Puis colle le texte ci-dessous.

---

Lis CLAUDE.md, docs/PLAN.md et docs/PROTOTYPE.md, puis ouvre docs/prototype.html et regarde les captures dans docs/captures/.

On attaque la phase 1 du plan : porter le prototype dans la stack cible (Vite + React + TypeScript + React Three Fiber + drei + Zustand, Web Audio natif), à parité, sans ajouter de fonctionnalités.

Avant de coder, propose-moi un plan découpé en étapes que je peux vérifier une par une, par exemple :
1. projet Vite initialisé, dépendances, tokens CSS, store ;
2. scène vide avec caméra iso, cadrage et lumières jour/nuit ;
3. pièce et mobilier statiques ;
4. objets interactifs, animations et hotspots ;
5. moteur audio et ses 5 canaux ;
6. mixeur et barre du haut ;
7. comparaison avec le prototype et corrections.

Reprends les valeurs exactes de docs/PROTOTYPE.md (couleurs, positions, réglages audio). Si tu dois t'en écarter, dis-moi pourquoi.
À la fin de chaque étape : `npm run build` doit passer, et dis-moi quoi vérifier dans le navigateur.
