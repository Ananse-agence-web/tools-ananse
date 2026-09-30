# Ce qu'on peut faire avec le web statique

Site de démonstration d'Ananse : une fonction par page, en français et en anglais. Le visiteur coche ce qu'il veut, puis demande son devis par e-mail.

Hugo extended **0.121.1**, sans framework ni police externe, **sans cookie ni traceur**.

    hugo server   # http://localhost:1313/ce-qu-on-peut-faire-avec-le-static/

| Quoi | Fichier |
|---|---|
| Liste des fonctions (textes FR/EN, catégorie, métiers, services, cookies) | `data/fonctions.json` |
| Catégories et métiers | `data/categories.json`, `data/metiers.json` |
| Démo d'une fonction | `layouts/partials/demos/<id>.html` + `assets/js/demos/<id>.js` |
| Textes de l'interface | `i18n/fr.toml`, `i18n/en.toml` |
| E-mail qui reçoit les devis | `hugo.toml` (`params.email`) |
| Couleurs (5 palettes, clair/sombre) | `assets/css/main.css` (haut du fichier) |
| Sélection, e-mail de devis, thème | `assets/js/main.js` |
| PDF, agenda, QR code | `assets/js/libs/` |

Après avoir ajouté ou modifié une fonction dans `data/fonctions.json` :

    node outils/pages.mjs

Ce script recrée les pages de `content/`. Il faut ensuite écrire la démo (`partials/demos/<id>.html`).

Chaque push sur `main` publie le site sur GitHub Pages (`.github/workflows/hugo.yml`).

## Vidéo de présentation

`static/video/presentation-fr|en.mp4` (+ affiche `.jpg` et sous-titres `.vtt`) sont fabriqués par `outils/video.py` : navigation enregistrée avec Playwright, voix de synthèse edge-tts, montage ffmpeg. Pour la refaire après un changement du site :

    hugo --baseURL http://localhost:1415/ -d _apercu
    python -m http.server 1415 -d _apercu      # dans un autre terminal
    python outils/video.py                      # ou : python outils/video.py fr

## Crédits

- Photo 360° de la visite virtuelle : épicerie Elisseïev, Moscou — Artem Svetlov, CC BY 2.0, via Wikimedia Commons (`static/img/magasin-360.jpg`).
- Visionneuse 360° : Pannellum 2.5.6, licence MIT (`static/libs/pannellum/`).
- QR codes : qrcode-generator de Kazuhiko Arase, licence MIT (`assets/js/libs/qrcode.js`).
