# Mise en ligne (Cloudflare)

**Hébergement actuel : Cloudflare Workers**, en site statique (`wrangler.jsonc`), adresse `lufiroom.an-alexcore.workers.dev` ; chaque push sur `main` republie.
Cloudflare a remplacé Netlify (`ce1319d`, `d1dc73b`) : gratuit, sans plafond de bande passante, adapté à un site qui sert beaucoup d'audio (124 Mo de musique). Les conditions des offres gratuites changent : relis-les au moment de t'inscrire.
La section Netlify, plus bas, reste pour mémoire, avec `netlify.toml`.

## Cloudflare Pages (ou Workers, voir plus bas)

1. Crée un compte sur [dash.cloudflare.com](https://dash.cloudflare.com), puis « Workers & Pages », « Create application », « Pages », « Connect to Git » : choisis GitHub et le dépôt `seyhen/LuFiRoom`.
2. Réglages de construction : framework « None », commande `npm run build`, dossier de sortie `dist`.
3. Variable d'environnement (Production) : `NODE_VERSION` = `22` (Vite 8 veut Node 20.19 ou plus).
4. « Save and Deploy ». Tu obtiens une adresse en `.pages.dev` (HTTPS), et chaque push sur `main` republie.
5. Domaine à toi : « Custom domains » du projet.

**Si Cloudflare t'a créé un Worker** (« Workers & Pages », « Create », import GitHub) plutôt qu'un projet Pages : c'est `wrangler.jsonc` à la racine qui compte (nom `lufiroom`, dossier publié `dist`, adresse `workers.dev` activée). La commande de déploiement est `npx wrangler deploy` ; si l'adresse reste « No URLs enabled », active `workers.dev` dans « Settings », « Domains & Routes ».

Cloudflare ne lit pas `netlify.toml` : c'est `public/_headers` (copié dans `dist/`) qui règle le cache et le type `audio/webm`. Les deux fichiers disent la même chose.
L'adresse absolue des aperçus de liens vient de `CF_PAGES_URL` (fournie par Cloudflare **Pages**) ; `SITE_URL` la remplace si tu as un domaine.
Sur **Workers**, `CF_PAGES_URL` n'existe pas : mets `SITE_URL` (par exemple `https://lufiroom.an-alexcore.workers.dev`) dans les variables de construction du Worker, sinon l'image d'aperçu n'est pas déclarée.
Limites de l'offre gratuite (à revérifier) : 25 Mo par fichier (ici le plus gros fait environ 2,6 Mo), 20 000 fichiers, 500 constructions par mois.

---

# Mise en ligne (Netlify, pour mémoire)

Plus utilisé : l'app est sur Cloudflare (ci-dessus). `netlify.toml` est gardé pour pouvoir y revenir ; il dit la même chose que `public/_headers`
(que Netlify lit aussi), en ajoutant la commande de construction et la version de Node. Si un en-tête change, change-le dans les deux.

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
si `ANALYTICS_SRC` est défini, une balise `<script defer>` est ajoutée à la page. `ANALYTICS_ATTRS` ajoute ses attributs (séparés par des espaces, `nom=valeur`).

```
ANALYTICS_SRC=https://exemple-de-service/script.js
ANALYTICS_ATTRS=data-domain=exemple.fr
```

À mettre dans les variables de construction de l'hébergeur (Cloudflare : réglages de construction du Worker ; Netlify : « Site configuration », « Environment variables »), pas dans le dépôt : le choix du service et ses identifiants ne regardent que toi.
Selon l'outil et le pays, une information aux visiteurs peut rester nécessaire : vérifie ses conditions (je ne peux pas te donner d'avis juridique). L'app n'a aujourd'hui ni cookie ni compte.
Le service worker ne garde pas ce script : hors ligne, il échoue sans bruit.

### Quel service ? (comparaison, octobre 2026)

Le choix est le tien. Les quatre ci-dessous sont **sans cookie** et ne gardent pas d'identifiant personnel ; prix et conditions changent : relis-les avant de t'inscrire.
L'app est une seule page sans changement d'adresse : chaque service comptera des visites, des pays, des appareils et des sites d'où l'on vient.
Savoir quelles pièces ou quels sons plaisent demanderait d'envoyer des évènements depuis le code (Plausible, Umami et GoatCounter le permettent ; Cloudflare non) : rien n'est prévu pour ça.

| | Cloudflare Web Analytics | Plausible | Umami | GoatCounter |
|---|---|---|---|---|
| Cookie | non | non | non | non |
| Prix | gratuit | payant (à partir d'environ 9 € par mois) ; gratuit en auto-hébergement (Community Edition) | offre gratuite sur Umami Cloud (plafond d'évènements par mois), payant au-delà ; gratuit en auto-hébergement | gratuit pour un usage non commercial (dons bienvenus), petit abonnement pour un usage commercial |
| Où sont les données | chez Cloudflare (entreprise américaine, réseau mondial) | dans l'UE (Allemagne) | Umami Cloud (choix de région à vérifier) ou ton serveur | dans l'UE (service d'un développeur indépendant) |
| Code source ouvert | non | oui | oui | oui |
| Évènements (pièces, sons) | non | oui | oui | oui |
| Effort avec `ANALYTICS_SRC` | aucun code : `ANALYTICS_SRC=https://static.cloudflareinsights.com/beacon.min.js`, `ANALYTICS_ATTRS=data-cf-beacon={"token":"TON_JETON"}` (sans espace dans le JSON) | aucun code : `ANALYTICS_SRC=https://plausible.io/js/script.js`, `ANALYTICS_ATTRS=data-domain=ton-domaine` (le script plus récent de Plausible, par site, demande en plus un petit appel d'initialisation : garder l'ancien ou ajouter cet appel) | aucun code : `ANALYTICS_SRC=https://cloud.umami.is/script.js`, `ANALYTICS_ATTRS=data-website-id=TON_ID` | aucun code : `ANALYTICS_SRC=https://gc.zgo.at/count.js`, `ANALYTICS_ATTRS=data-goatcounter=https://TON_NOM.goatcounter.com/count` |
| À savoir | le site est déjà chez Cloudflare : un compte de plus inutile ; tableau de bord simple, données échantillonnées quand le trafic est fort, durée de conservation limitée | le plus complet et le plus soigné des quatre ; la seule solution UE clé en main, mais payante | le plus souple si tu as un serveur | minimaliste, léger, sans prétention |

**Recommandation** : commencer par **Cloudflare Web Analytics**. C'est gratuit, sans cookie, déjà là (même compte que l'hébergement), et le point d'accroche suffit : deux variables et une reconstruction. Ça répond à la seule question utile au début (combien de visites, d'où, sur quels appareils).
Si l'hébergement des données dans l'UE compte, ou le jour où tu veux savoir quelles pièces et quels sons sont aimés : **GoatCounter** si le projet reste non commercial (gratuit), **Plausible** s'il devient payant (abonnement, mais le plus abouti). Umami n'a d'intérêt que si tu as déjà un serveur à toi.

## Modèle économique

Pistes et recommandation dans `docs/MODELE-ECONOMIQUE.md`.
