# Fiches des stores (brouillon)

Brouillon à copier dans App Store Connect et la Google Play Console. Rien ici n'est publié. Ce qui est entre crochets reste à compléter par le propriétaire.

- Identifiant : `com.lufiroom.app` (iOS et Android ; définitif après la première publication).
- Politique de confidentialité : `https://[DOMAINE DU SITE]/confidentialite.html` (FR) et `/privacy.html` (EN), fichiers `public/confidentialite.html` et `public/privacy.html`. Le champ de contact y est à compléter.
- Site : `https://[DOMAINE DU SITE]/`

## Nom, sous-titre, descriptions

**Nom** : LufiRoom (9 caractères ; limite 30).

### Français

- **Sous-titre App Store (30 max)** : `Ambiances sonores en 3D` (23)
- **Description courte Google Play (80 max)** : `Touche les objets d'une pièce 3D : pluie, feu, vagues, musique lofi.` (68)
- **Description longue** :

> LufiRoom, ce sont des petites pièces en 3D isométrique, toutes douces et arrondies, où chaque objet est un interrupteur de son. Touche la radio pour lancer de la musique lofi, le ventilateur pour un bruit blanc, la fenêtre pour la pluie… et compose l'ambiance qui t'aide à travailler, lire ou dormir.
>
> • Quinze pièces, chacune avec son décor et ses sons : chambre, cabane, café, plage, train de nuit, toit-terrasse, atelier, onsen, phare, sous-marin, marché de nuit, igloo, cabane perchée, laverie de nuit, serre.
> • Un mixeur pour régler le volume de chaque son, sans toucher la 3D si tu préfères.
> • La météo au choix (pluie, orage, neige…), et le jour et la nuit qui suivent l'heure.
> • Une radio qui joue de la musique douce, propre à chaque pièce.
> • Un minuteur de sommeil pour s'endormir tranquille.
> • Tes ambiances enregistrées, et un lien pour en partager une.
> • Le son continue écran verrouillé ou appli en arrière-plan, avec les commandes sur l'écran de verrouillage.
> • Tout est dans l'appli : elle fonctionne hors ligne, sans connexion.
> • Sans compte, sans publicité, sans pistage. Tes préférences restent sur ton appareil.
> • En français et en anglais.

- **Mots-clés App Store (100 max, séparés par des virgules, sans espace)** :
  `lofi,ambiance,bruit blanc,pluie,sommeil,relaxation,concentration,étude,sons nature,méditation,calme` (99)

### English

- **App Store subtitle (30 max)** : `Cozy 3D ambient sound rooms` (27)
- **Google Play short description (80 max)** : `Tap objects in cozy 3D rooms: rain, fire, waves, lofi music. Build your calm.` (77)
- **Long description** :

> LufiRoom is a set of soft, rounded little isometric 3D rooms where every object is a sound switch. Tap the radio for lofi music, the fan for white noise, the window for rain... and build the ambience that helps you work, read or sleep.
>
> • Fifteen rooms, each with its own look and sounds: bedroom, cabin, café, beach, night train, rooftop, workshop, onsen, lighthouse, submarine, night market, igloo, treehouse, night laundromat, greenhouse.
> • A mixer to set each sound's volume, without touching the 3D if you prefer.
> • Weather of your choice (rain, storm, snow...), and day and night that follow your clock.
> • A radio playing soft music, specific to each room.
> • A sleep timer to drift off peacefully.
> • Save your mixes and share one with a link.
> • Sound keeps playing with the screen locked or the app in the background, with lock screen controls.
> • Everything is inside the app: it works fully offline.
> • No account, no ads, no tracking. Your preferences stay on your device.
> • In French and English.

- **Keywords (100 max)** : `lofi,ambient,white noise,rain,sleep,relax,focus,study,nature sounds,meditation,calm,asmr` (88)

Vérifier le décompte des caractères dans la console avant de coller (les décomptes ci-dessus ont été calculés par script).

## Catégorie

- **App Store** : catégorie principale **Santé et bien-être** ; secondaire **Musique**. Justification : l'usage est de se détendre, se concentrer, dormir ; l'appli n'est pas un lecteur de musique (pas de catalogue ni de playlists), donc Musique en principal l'exposerait à des attentes qu'elle ne remplit pas. Alternative : **Style de vie**, plus neutre, moins concurrentielle que Santé et bien-être.
- **Google Play** : catégorie **Santé et remise en forme** ou **Style de vie** ; **Musique et audio** est possible mais très concurrentielle. Proposition : Style de vie. Type : application (pas un jeu).

## Classification par âge

Aucun contenu sensible : pas de violence, de contenu sexuel, de langage cru, de jeux d'argent, d'alcool ou de drogue (ni d'allusion), pas de contenu généré par les utilisateurs visible par d'autres, pas de chat, pas d'achats, pas de navigation web libre.
- App Store : 4+ (répondre « Aucun » partout ; « Contrôle parental », « Vérification de l'âge » : non).
- Google Play (IARC) : réponses « Non » à tout ; résultat attendu : PEGI 3 / Tous publics. Pas de public cible enfant : choisir 13+ ou 18+ comme public cible pour éviter le programme « Familles » (la politique dit que l'appli ne vise pas spécifiquement les enfants).

## Google Play : « Sécurité des données »

- Votre appli collecte-t-elle ou partage-t-elle des données utilisateur ? **Non.**
- Types de données (localisation, infos perso, finances, santé, messages, photos, audio, fichiers, agenda, contacts, activité, navigation web, infos sur l'appareil, identifiants) : **aucun collecté, aucun partagé.**
- Données chiffrées en transit : sans objet (le site est servi en HTTPS ; l'appli n'envoie rien). Si le formulaire insiste : **Oui**.
- Possibilité de demander la suppression : sans objet, rien n'est collecté ; les préférences locales s'effacent en désinstallant.
- URL de la politique de confidentialité : obligatoire (voir plus haut).
- Annonces : **non** (« Contient des annonces » : non). Accès à l'appli sans compte : oui.
- Note : si la mesure d'audience du site (`ANALYTICS_SRC`) était un jour ajoutée à l'appli mobile, il faudrait reprendre ces réponses. Aujourd'hui elle n'y est pas.

## App Store : « Privacy Nutrition Labels »

- Collectez-vous des données de cette app ? **Non, nous ne collectons aucune donnée de cette app.** (« Data Not Collected » ; aucun suivi.)
- Cohérent avec `ios/App/App/PrivacyInfo.xcprivacy` : `NSPrivacyTracking` false, aucun domaine de suivi, aucune donnée collectée.
- API à « raison requise » déclarée dans ce manifeste : UserDefaults (CA92.1), prudence : l'usage vient de la coque Capacitor (le code natif de l'app n'en utilise pas directement ; le manifeste propre à Capacitor est vide). Le `localStorage` de la WebView n'est pas une API concernée. À revérifier à l'archivage dans Xcode : le rapport de confidentialité (Product > Archive > Generate Privacy Report) liste ce que les frameworks déclarent.
- Chiffrement : `ITSAppUsesNonExemptEncryption` = false dans `Info.plist` (HTTPS standard seulement). Sur App Store Connect, répondre de même (« exempt »).

## Notes pour la revue Apple

> LufiRoom n'a pas besoin de compte : ouvrir l'appli suffit. Pour tester :
> 1. Ouvrir l'appli : une pièce en 3D s'affiche. Toucher un objet (la radio, le ventilateur, la fenêtre…) lance son son. Le son ne démarre qu'après un toucher.
> 2. Le mixeur (barre du bas ou panneau) liste un son par carte avec son volume.
> 3. Choisir une autre pièce avec le sélecteur de pièces du haut (15 pièces).
> 4. Lancer un son, verrouiller l'écran : le son continue (mode d'arrière-plan « audio »). Les commandes de lecture/pause apparaissent sur l'écran de verrouillage.
> 5. Minuteur de sommeil : menu du haut, choisir une durée ; le son s'estompe à la fin.
> 6. Couper le réseau : tout fonctionne (pièces, sons et musique embarqués dans l'appli).
>
> Pourquoi ce n'est pas un simple site web : l'appli embarque ses 15 pièces et tous ses sons (hors ligne complet, pas de chargement réseau) ; elle joue en arrière-plan écran verrouillé avec les commandes de l'écran de verrouillage (Media Session / mode audio d'arrière-plan) ; elle a un minuteur de sommeil ; elle s'installe comme une vraie appli, avec son icône et son écran de lancement. Aucune donnée n'est collectée ; aucun achat intégré ; aucune publicité.

À vérifier avant d'envoyer cette note : chaque point doit être vrai dans la version soumise (emplacements des menus, commandes de l'écran verrouillé sur iOS, extinction du minuteur). Je n'ai pas testé sur un appareil iOS : ne rien affirmer qui n'a pas été essayé. Les emplacements exacts des boutons sont à adapter à l'interface réelle.

## Captures d'écran à produire

Idéalement les mêmes scènes en FR et EN (au minimum la langue principale). 5 à 8 captures par appareil, sans cadre d'appareil trompeur, sans éléments qui ne sont pas dans l'appli.

Scènes proposées : (1) la chambre de nuit sous la pluie avec la radio allumée ; (2) la cabane avec le feu ; (3) la plage de jour ; (4) le mixeur ouvert ; (5) le sélecteur de pièces ; (6) le sélecteur de météo ; (7) le minuteur de sommeil ; (8) l'igloo ou le sous-marin.

| Store | Appareil | Taille (pixels) | Obligatoire |
|---|---|---|---|
| App Store | iPhone 6,9" | 1320 x 2868 (ou 1290 x 2796) | oui |
| App Store | iPhone 6,5" | 1284 x 2778 (ou 1242 x 2688) | oui si 6,9" absent ; sinon facultatif |
| App Store | iPad 13" | 2064 x 2752 (ou 2048 x 2732) | oui si l'appli reste compatible iPad |
| Google Play | Téléphone | 16:9 ou 9:16, côtés entre 320 et 3840 px, au moins 2 (8 max) ; par ex. 1080 x 1920 | oui |
| Google Play | Tablette 7" et 10" | idem | conseillé |
| Google Play | Icône | 512 x 512 PNG | oui |
| Google Play | Image de présentation | 1024 x 500 | oui |

Les exigences des stores évoluent : revérifier les tailles dans App Store Connect et la Play Console au moment de publier. Décision à prendre : garder l'iPad (sinon retirer iPad de la cible Xcode, `TARGETED_DEVICE_FAMILY`) ; les captures iPad sont sinon à produire aussi.

## Liste de contrôle « avant de publier »

**Bloquant**
- [ ] **Licences audio de la radio** : les pistes de `public/audio/radio/` (RhythmicInk : Velvet Lounge, Quiet Corner, Soft Focus, Warm Cadence, Warm Vinyl, Velvet Keys…) sont notées « à confirmer par le propriétaire » dans `public/audio/CREDITS.md`. Tant que la licence autorisant l'usage commercial et la redistribution dans une appli n'est pas confirmée (justificatif conservé), ne pas publier. Si elle ne l'est pas : retirer ces pistes (la radio générative sert de repli) puis relancer `npm run audio:check`.
- [ ] Contact à compléter dans `public/confidentialite.html` et `public/privacy.html`, puis site déployé : l'URL de la politique doit répondre en ligne avant l'envoi aux stores.

**Comptes**
- [ ] Apple Developer Program (99 USD/an) ; accord des apps payantes/gratuites signé ; fiche créée dans App Store Connect avec l'identifiant `com.lufiroom.app`.
- [ ] Google Play Console (25 USD, une fois) ; vérification d'identité terminée ; pour un compte personnel récent, la règle de test fermé (nombre de testeurs, durée) est à vérifier avant la production.

**Identifiant et versions**
- [ ] `com.lufiroom.app` identique dans `capacitor.config.ts`, le projet Xcode (`PRODUCT_BUNDLE_IDENTIFIER`) et Android (`applicationId`) ; définitif après la première publication.
- [ ] Numéro de version et de build (`MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` ; `versionName`, `versionCode`) incrémentés à chaque envoi.

**Android**
- [ ] Keystore de signature créé, **sauvegardé à deux endroits hors du dépôt**, mots de passe notés (le perdre empêche toute mise à jour sans la signature Play App Signing) ; activer Play App Signing.
- [ ] Construire un bundle `.aab` en release (`./gradlew bundleRelease`), tester l'APK de release sur un vrai téléphone (son en arrière-plan, hors ligne).
- [ ] Niveau d'API cible conforme à l'exigence actuelle de Google Play.

**iOS**
- [ ] Équipe de signature choisie dans Xcode, profil de distribution, archive, envoi via Xcode ou Transporter, test via TestFlight.
- [ ] Ouvrir le projet dans Xcode : confirmer que `PrivacyInfo.xcprivacy` apparaît dans le groupe App et la phase « Copy Bundle Resources » (le fichier `project.pbxproj` a été édité à la main, sans Xcode).
- [ ] Tester sur appareil : son écran verrouillé, commandes de l'écran verrouillé, interruption par un appel, retour au premier plan.

**Contenu des fiches**
- [ ] Textes FR/EN, mots-clés, catégorie, classification par âge, formulaires de confidentialité (ci-dessus).
- [ ] Captures d'écran produites aux bonnes tailles ; icône 1024 x 1024 sans transparence (App Store) et 512 x 512 (Play).
- [ ] URL d'assistance (obligatoire Apple) : le site ou une page de contact.
- [ ] `public/audio/CREDITS.md` complet (Pixabay Content License pour les boucles déjà listées) ; mentions de licence dans l'appli si une licence l'exige.
- [ ] `npm test` et `npm run audio:check` verts sur le commit publié ; `npm run mobile:sync` fait juste avant l'archive.
