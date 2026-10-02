# Mise en ligne (Netlify)

L'app est un site statique : `npm run build` produit `dist/`, et `netlify.toml` dit à Netlify quoi lancer, quoi publier et comment mettre les fichiers en cache.

## Première mise en ligne

1. Sur [netlify.com](https://www.netlify.com), « Add new site », « Import an existing project », choisis GitHub puis le dépôt `seyhen/LuFiRoom`.
2. Branche à publier : `main`. Netlify lit `netlify.toml` : commande `npm run build`, dossier `dist`, Node 22. Rien d'autre à remplir.
3. Lance le déploiement. Netlify te donne une adresse en `.netlify.app` (modifiable dans « Site configuration », « Change site name »).
4. À chaque push sur `main`, Netlify reconstruit et publie. Les autres branches et les pull requests ont une adresse d'aperçu.

## Nom de domaine

« Domain management », « Add a domain ». Deux cas :
- tu achètes le domaine chez Netlify : tout se configure seul ;
- tu l'as acheté ailleurs : Netlify te donne les enregistrements DNS à créer chez ton registrar (ou des serveurs de noms à indiquer).

Le HTTPS (Let's Encrypt) s'active tout seul une fois le domaine relié. Il est obligatoire pour l'installation de l'app et le service worker.
Après le branchement : mets l'adresse finale dans « Domain management » en domaine principal, pour que `www` et l'adresse `.netlify.app` redirigent vers elle.

## Ce que fait `netlify.toml`

| Fichiers | Cache | Pourquoi |
|---|---|---|
| `/assets/*`, `/workbox-*.js` | 1 an, `immutable` | leur nom change avec leur contenu |
| `/`, `index.html`, `sw.js`, `registerSW.js`, `manifest.webmanifest` | `no-cache` (toujours revalidés) | sinon une mise à jour ne parvient jamais aux visiteurs |
| `/audio/*` | 1 jour | les sons n'ont pas de nom haché |

Il envoie aussi `audio/webm` pour les `.webm` (sinon annoncés comme de la vidéo), `application/manifest+json` pour le manifeste, et trois en-têtes de sécurité simples.
Il n'y a pas de règle de redirection vers `index.html` : un son manquant doit répondre 404 (l'app retombe alors sur le MP3, puis sur la synthèse).

## Remplacer un son déjà en ligne

Le service worker garde les sons à vie dans le cache du visiteur (`CacheFirst`). Si tu remets un fichier **au même nom**, ceux qui l'ont déjà ne le recevront jamais.
Donne un nouveau nom au fichier (`rain-2.webm`) et change-le dans `src/rooms/*.ts`, ou, pour tout renouveler, change le nom du cache `sons` dans `vite.config.ts`.

## À vérifier après la première mise en ligne

- L'adresse s'ouvre en HTTPS, la chambre apparaît, les sons démarrent au premier toucher.
- Outils de développement, Application : service worker actif, manifeste sans erreur, « Installable ».
- Réseau en « Hors connexion », recharger : l'app démarre.
- Un son de test, ouvert à la main (`/audio/...`), répond avec le bon type (`audio/webm`) et un en-tête `accept-ranges: bytes`.
- Sur un téléphone : installation (Android : bouton « Installer l'app » ; iPhone : Partager, « Sur l'écran d'accueil »).

## Plus tard

- **Aperçu à la publication d'un lien** (Open Graph) : une image et un titre. Il faut l'adresse définitive (l'image doit avoir une adresse absolue), donc après le nom de domaine.
- **Mesure d'audience** et **modèle économique** : pas encore, voir `docs/PLAN.md`.
