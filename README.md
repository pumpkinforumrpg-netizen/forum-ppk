# Pumpkins — forum-ppk

Dépôt de fichiers externes du forum RPG Forumactif **Pumpkins**. Hébergé via Cloudflare Pages, consommé par le forum officiel (`pumpkinsrpg.forumactif.com`), le Guidebook et le Registre.

La reconstruction de ce dépôt suit le cahier technique de migration (document de travail conservé hors dépôt). Règle absolue : **les templates actifs du forum restent dans le panneau d'administration Forumactif** (Affichage → Templates) — ce dépôt n'héberge que les ressources statiques (CSS, JS, pages HTML du Guidebook/Compendium/Registre, assets).

## Structure

```text
forum-ppk/
├── README.md
├── templates/          # copie de référence en texte brut des templates Forumactif
│                        # (la version active reste toujours celle du panneau d'administration)
└── public/              # racine servie par Cloudflare Pages
    ├── index.html        # page de contrôle de déploiement
    ├── css/
    │   ├── core.css        # variables de thème (dark/light/autumn/winter), partagé partout
    │   ├── forum.css        # CSS générique du forum classique
    │   ├── chatbox.css
    │   ├── calendar.css
    │   ├── perles.css
    │   ├── guidebook.css
    │   ├── compendium.css
    │   └── registre.css
    ├── js/
    │   ├── core.js          # namespace PPK, moteur de thèmes, loadScriptOnce/loadStyleOnce
    │   ├── forum.js          # comportements du forum, chargés avec détection de page
    │   ├── chatbox.js
    │   ├── calendar.js
    │   ├── perles.js
    │   ├── guidebook.js
    │   ├── compendium.js
    │   └── registre.js
    ├── guidebook/
    │   ├── index.html
    │   └── pages/            # fragments de contenu (pas de documents HTML complets)
    ├── registre/
    │   └── index.html
    └── assets/
        ├── images/
        └── audio/
```

## Modifications quotidiennes

| Besoin | Fichier(s) |
|---|---|
| Couleurs / thèmes | `public/css/core.css` |
| Ajouter un thème | `public/css/core.css` + `public/js/core.js` (tableau `PPK.THEMES`) |
| Apparence du forum | `public/css/forum.css` |
| Comportement du forum | `public/js/forum.js` |
| Chatbox | `public/css/chatbox.css`, `public/js/chatbox.js` |
| Calendrier | `public/css/calendar.css`, `public/js/calendar.js` |
| Perles de pluie | `public/css/perles.css`, `public/js/perles.js` |
| Règlement / contenu du Guidebook | `public/guidebook/pages/*.html` |
| Apparence / navigation du Guidebook | `public/css/guidebook.css`, `public/js/guidebook.js` |
| Registre | `public/registre/index.html`, `public/css/registre.css`, `public/js/registre.js` |

## Branches

- `staging` → forum Forumactif de test
- `main` → production

## Cloudflare Pages

```text
Production branch : main
Build command     : exit 0
Build output directory : public
```

## État de la migration

Voir le rapport de migration le plus récent pour le détail de ce qui est migré, vérifié, ou en attente ("À VÉRIFIER").
