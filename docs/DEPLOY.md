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

## Aperçu des liens (Open Graph)

Quand on colle l'adresse dans une messagerie ou un réseau, l'aperçu montre le titre, la description et `public/og.jpg` (1200 × 630, la chambre en plein cadre).
Les titre et description sont dans `index.html`. Les adresses **absolues** (`og:url`, `og:image`, lien canonique) sont ajoutées au build par `vite.config.ts`, car elles dépendent du domaine :

- sur Netlify, la variable `URL` (adresse principale du site, nom de domaine compris) est fournie toute seule : rien à faire ;
- ailleurs, ou pour forcer une adresse : variable d'environnement `SITE_URL` (par exemple `https://exemple.fr`). PowerShell : `$env:SITE_URL = "https://exemple.fr"; npm run build`.
- sans adresse (build local), seuls le titre et la description sont déclarés.

Pour changer l'image : remplacer `public/og.jpg` (même nom, 1200 × 630, JPEG). Les messageries gardent l'ancienne un moment ; leurs outils de « débogage de lien » forcent la mise à jour.

## Mesure d'audience

Rien n'est actif : aucun script n'est chargé tant que tu n'as pas choisi de service. Le point d'accroche est prêt (`vite.config.ts`) : à la construction,
si `ANALYTICS_SRC` est défini, une balise `<script defer>` est ajoutée à la page. `ANALYTICS_ATTRS` ajoute ses attributs.

```
ANALYTICS_SRC=https://exemple-de-service/script.js
ANALYTICS_ATTRS=data-domain=exemple.fr
```

À mettre dans « Site configuration », « Environment variables » de Netlify (pas dans le dépôt : le choix du service et ses identifiants ne regardent que toi).
Choisis un service **sans cookie** et qui ne garde pas d'identifiant personnel ; chaque service documente l'adresse de son script et ses attributs.
Selon l'outil et le pays, une information aux visiteurs peut rester nécessaire : vérifie ses conditions (je ne peux pas te donner d'avis juridique). L'app n'a aujourd'hui ni cookie ni compte.
Le service worker ne garde pas ce script : hors ligne, il échoue sans bruit.

## Modèle économique

Pistes et recommandation dans `docs/MODELE-ECONOMIQUE.md`.
