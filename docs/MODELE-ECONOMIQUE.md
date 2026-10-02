# Modèle économique : pistes

Note de réflexion, sans code. Rien n'est décidé ; elle sert à choisir quoi tester en premier.

## Ce que le projet a déjà, et ce qui compte

- **Une app sans compte.** Tout est local (ambiances, volumes, dernière pièce). C'est un atout (rien à protéger, pas de données à gérer) et une contrainte : vendre quelque chose demande de savoir « qui a payé » sans identifiant.
- **Des pièces qui sont des données** (`src/rooms/*.ts`) : en ajouter coûte surtout du travail de décor et de sons, pas de moteur. C'est la matière naturelle d'une offre.
- **Une règle de licence stricte** pour les sons (CC0 ou achetés, usage commercial permis). Tant qu'elle est tenue, vendre l'app est possible ; une licence « non commerciale » dans un seul fichier l'interdirait. À vérifier fichier par fichier avant toute vente (`public/audio/CREDITS.md`).
- **Un coût d'hébergement très bas** (site statique, sons de quelques Mo) : l'app peut rester gratuite longtemps sans se mettre en danger.

## Les options

| Option | Principe | Pour | Contre |
|---|---|---|---|
| **Gratuit, soutien libre** | Un lien « Offrir un café » (plateforme de dons) | Quasi aucun développement, aucune friction, cohérent avec une app apaisante | Revenu faible et irrégulier |
| **Chambres en achat unique** | La chambre et la cabane gratuites, d'autres pièces payantes (café, bibliothèque…) à prix fixe | Colle à la structure de l'app ; chaque pièce se vend d'elle-même ; pas d'abonnement à justifier | Il faut produire des pièces ; il faut un moyen de débloquer sans compte |
| **Pack premium unique** | Un achat qui débloque toutes les pièces et fonctions (ambiances illimitées…) | Simple à expliquer, une seule transaction | On vend avant d'avoir beaucoup à montrer |
| **Abonnement** | Accès continu à un catalogue qui grandit | Revenu régulier | Lourd à justifier pour une app d'ambiance, et demande des comptes, de la gestion, du support |
| **Publicité** | Bannières | — | Contraire à l'esprit de l'app (calme, mobile, plein écran) et à la lecture en arrière-plan : à écarter |

## Ce que je recommande

1. **Maintenant** : rester gratuit, ajouter un **lien de soutien** discret, et mesurer l'audience (voir `docs/DEPLOY.md`) pour savoir si des gens reviennent. Rien à construire de lourd.
2. **Si l'usage est là** : **pièces en achat unique**, avec les deux premières gratuites. C'est l'option qui demande le moins de nouveauté technique pour le plus de sens.
3. L'abonnement et la publicité : pas pour cette app.

## Ce que ça demanderait côté technique (pour l'option 2)

- Un champ `premium` dans `Room` (`src/rooms/types.ts`), une pièce verrouillée dans le sélecteur (puce avec un cadenas, aperçu possible).
- Un moyen d'acheter (une plateforme de paiement qui gère la TVA et renvoie un reçu) et de **débloquer sans compte** : le plus simple est une clé de licence saisie une fois et gardée dans le navigateur. Elle se vérifie auprès du fournisseur ou par une signature. Un petit serveur (ou une fonction Netlify) est alors nécessaire.
- Que les sons et décors payants ne soient pas servis à tout le monde : sinon n'importe qui peut les prendre. Soit on accepte ce risque (pour une app d'ambiance à petit prix, beaucoup le font), soit les fichiers sont servis après vérification.
- Une page de mentions légales et de conditions de vente, et le choix du statut pour vendre (ce que je ne peux pas trancher à ta place).

## Questions ouvertes

- Qui est le public : des gens qui travaillent, qui dorment, qui révisent ? Ça décide quelles pièces valent d'être payantes.
- Quel budget de temps pour produire une nouvelle pièce (décor, sons, test) ? Il détermine le rythme d'un catalogue.
- Quel prix semble juste pour une pièce ? À tester avec quelques personnes avant de construire quoi que ce soit.
