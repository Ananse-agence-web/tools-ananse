# Vidéo « Des textes modifiables par vous » : démo du CMS sur https://atelier.an6.fr
#   Partie A : le pied de page, puis la modification du téléphone et de l'e-mail dans /admin/.
#   Partie B : après la mise en ligne, on actualise et on montre le pied de page modifié.
#
# Le CMS filmé est le vrai /admin/ du site, mais branché sur le dépôt de test de Decap
# (Playwright n'a pas de session GitHub) : la vraie modification se fait à la main dans le CMS,
# entre la partie A et la partie B. Le temps d'attente n'apparaît pas dans la vidéo.
#
# Usage :
#   python outils/video_cms.py a      (site encore avec 06 12 34 56 78)
#   ... modifier le téléphone et l'e-mail dans https://atelier.an6.fr/admin/, attendre la mise en ligne ...
#   python outils/video_cms.py b      (écrit static/video/cms-fr.mp4/.jpg/.vtt)
#   python outils/video_cms.py assembler   (remonte la vidéo à partir des deux parties déjà faites)
# Ensuite, remettre 06 12 34 56 78 et contact@exemple.fr dans le CMS (la démo garde ses valeurs).

import asyncio, json, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright
from video import FFMPEG, INIT, W, H, duree, voix

SITE = "https://atelier.an6.fr"
SORTIE = Path(__file__).resolve().parent.parent / "static" / "video"
# Copie locale du dépôt (privé) an6-dev/atelier-site, à jour (git pull).
DEPOT = Path(__file__).resolve().parents[2] / "Clients" / "Demos Airbnb" / "atelier" / "siteweb"
TMP = Path(tempfile.gettempdir()) / "ananse-video-cms"
VOIX = "fr-FR-DeniseNeural"
AVANT = {"telephone": "06 12 34 56 78", "email": "contact@exemple.fr"}
APRES = {"telephone": "06 99 99 99 99", "email": "contact-demo-video@exemple.fr"}

SCENES = {
    "a": [
        "Voici le site d'un studio en location, réalisé par Ananse. En bas de page : le téléphone et l'adresse e-mail.",
        "Pour les changer, inutile d'appeler un développeur. On ouvre l'espace de gestion du site, à l'adresse « slash admin ».",
        "On choisit « Le logement », et on descend jusqu'au téléphone et à l'e-mail.",
        "On remplace le numéro de téléphone…",
        "…puis l'adresse e-mail. C'est aussi simple que de remplir un formulaire.",
        "Un clic sur « Publier », et c'est terminé !",
    ],
    "b": [
        "Le site se met à jour tout seul, en une minute environ.",
        "On actualise la page : le nouveau numéro et la nouvelle adresse sont en ligne.",
        "Facile, et accessible à tout le monde. Avec Ananse, vous gardez la main sur vos informations, et sur votre site.",
    ],
}

def lire(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (video Ananse)"})
    return urllib.request.urlopen(req).read().decode("utf-8")


# Sous-titres anglais (la voix reste en français).
SOUS_TITRES_EN = {
    "a": [
        "Here is the website of a holiday studio, made by Ananse. At the bottom of the page: the phone number and the e-mail address.",
        "To change them, no need to call a developer. Just open the site's management area, at “slash admin”.",
        "Choose “Le logement” (the accommodation), then scroll down to the phone and e-mail.",
        "Replace the phone number…",
        "…then the e-mail address. It's as easy as filling in a form.",
        "One click on “Publier” (Publish), and you're done!",
    ],
    "b": [
        "The site updates itself, in about a minute.",
        "Refresh the page: the new number and the new address are online.",
        "Easy, and accessible to everyone. With Ananse, you stay in control of your information, and of your website.",
    ],
}


# Le vrai /admin/, branché sur le dépôt de test de Decap, avec le vrai fichier du site.
def config_test():
    c = lire(SITE + "/admin/config.yml")
    debut, fin = c.index("backend:"), c.index("locale:")
    return c[:debut] + "backend:\n  name: test-repo\n" + c[fin:]


def page_admin():
    h = lire(SITE + "/admin/")
    fichiers = {}
    for f in ("logement", "reservations"):
        fichiers[f + ".yaml"] = {"content": (DEPOT / "data" / f"{f}.yaml").read_text(encoding="utf-8")}
    script = "<script>window.repoFiles = " + json.dumps({"data": fichiers}).replace("<", "\\u003c") + ";"
    # Masque le lien « Test Backend » de l'en-tête (absent avec le vrai dépôt GitHub).
    script += "new MutationObserver(() => document.querySelectorAll('a').forEach(a => { if (/Test Backend/i.test(a.textContent)) a.style.visibility = 'hidden'; })).observe(document.documentElement, {childList: true, subtree: true});</script>"
    return h.replace("<script src=", script + "\n  <script src=", 1)


def surligner(page, sel):
    page.evaluate("""(s) => document.querySelectorAll(s).forEach(e => { e.style.outline = '4px solid #F2B33D'; e.style.outlineOffset = '4px'; e.style.borderRadius = '6px'; e.style.transition = 'outline-color .3s'; })""", sel)


# Loupe : le téléphone et l'e-mail du pied de page, en grand.
def loupe(page, titre, couleur):
    page.evaluate("""([titre, couleur]) => { const liens = [".pied a[href^='tel:']", ".pied a[href^='mailto:']"].map(q => document.querySelector(q).textContent);
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;right:48px;top:110px;z-index:99980;background:#fff;border:4px solid ${couleur};border-radius:18px;padding:22px 30px;box-shadow:0 18px 50px rgb(0 0 0 / .25);font:600 30px/1.5 system-ui;color:#1c1b1a;opacity:0;transform:scale(.9);transition:all .5s`;
      d.innerHTML = `<div style="font:700 17px system-ui;letter-spacing:.08em;text-transform:uppercase;color:${couleur};margin-bottom:6px"></div><div><small style="font-size:18px;opacity:.6">Tél.</small> <span></span></div><div><small style="font-size:18px;opacity:.6">E-mail</small> <span></span></div>`;
      d.children[0].textContent = titre; d.querySelectorAll('span')[0].textContent = liens[0]; d.querySelectorAll('span')[1].textContent = liens[1];
      document.body.append(d); requestAnimationFrame(() => { d.style.opacity = 1; d.style.transform = 'none'; }); }""", [titre, couleur])


def bandeau(page, texte, sous="", barre=False):
    page.evaluate("""([t, s, b]) => { const d = document.createElement('div'); d.id = 'bandeau-video';
      d.style.cssText = 'position:fixed;inset:0;z-index:99990;display:grid;place-content:center;gap:18px;text-align:center;background:rgb(20 18 16 / .86);color:#fff;font:700 40px/1.25 system-ui;opacity:0;transition:opacity .6s;padding:40px';
      d.innerHTML = '<div style="font-size:72px;color:#F2B33D">✦</div><div></div><div style="font:500 24px system-ui;opacity:.85"></div>' + (b ? '<div style="width:420px;height:10px;margin:8px auto 0;border-radius:6px;background:rgb(255 255 255 / .2);overflow:hidden"><i style="display:block;height:100%;width:0;background:#F2B33D;transition:width 3.2s linear"></i></div>' : '');
      d.children[1].textContent = t; d.children[2].textContent = s; document.body.append(d);
      requestAnimationFrame(() => { d.style.opacity = 1; const i = d.querySelector('i'); if (i) requestAnimationFrame(() => i.style.width = '100%'); }); }""", [texte, sous, barre])


def enregistrer(partie, durees):
    debuts = []
    with sync_playwright() as p:
        nav = p.chromium.launch()
        ctx = nav.new_context(viewport={"width": W, "height": H}, color_scheme="light", locale="fr-FR",
                              record_video_dir=str(TMP / partie), record_video_size={"width": W, "height": H})
        ctx.add_init_script(INIT)
        if partie == "a":
            config, html_admin = config_test(), page_admin()
            ctx.route(SITE + "/admin/config.yml", lambda r: r.fulfill(body=config, content_type="text/yaml; charset=utf-8"))
            ctx.route(SITE + "/admin/", lambda r: r.fulfill(body=html_admin, content_type="text/html; charset=utf-8"))
        page = ctx.new_page()

        def aller(cible, clic=False):
            el = page.locator(cible).first if isinstance(cible, str) else cible
            el.scroll_into_view_if_needed()
            b = el.bounding_box()
            page.mouse.move(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2, steps=26)
            if clic:
                page.wait_for_timeout(150); page.mouse.click(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2)
            return el

        def bas_de_page():
            page.evaluate("window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})")

        t0 = [0]
        def scene(i, actions):
            debut = time.time() - t0[0]
            debuts.append(debut)
            actions()
            reste = debut + durees[i] + 0.45 - (time.time() - t0[0])
            if reste > 0: page.wait_for_timeout(int(reste * 1000))

        if partie == "a":
            page.goto(SITE + "/"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(500)
            t0[0] = time.time()
            def pied():
                page.mouse.move(640, 300, steps=20); page.wait_for_timeout(1600)
                bas_de_page(); page.wait_for_timeout(1400)
                surligner(page, ".pied a[href^='mailto:'], .pied a[href^='tel:']")
                aller(".pied a[href^='tel:']"); page.wait_for_timeout(500)
                loupe(page, "Avant", "#8a8580")
            scene(0, pied)

            def admin():
                page.goto(SITE + "/admin/", wait_until="commit"); page.get_by_role("button", name="Se connecter").wait_for(); page.wait_for_timeout(1200)
                aller(page.get_by_role("button", name="Se connecter"), clic=True)
                page.get_by_text("Le logement").first.wait_for(); page.wait_for_timeout(600)
            scene(1, admin)

            def logement():
                aller(page.get_by_text("Le logement").first, clic=True); page.wait_for_timeout(900)
                aller(page.get_by_text("Description, équipements, contact").first, clic=True)
                page.get_by_label("Téléphone", exact=True).wait_for(); page.wait_for_timeout(800)
                tel = page.get_by_label("Téléphone", exact=True)
                tel.evaluate("e => e.scrollIntoView({behavior: 'smooth', block: 'center'})"); page.wait_for_timeout(1200)
                aller(tel)
            scene(2, logement)

            def champ(label, valeur):
                el = page.get_by_label(label, exact=True)
                aller(el, clic=True); page.wait_for_timeout(250)
                el.press("Control+a"); page.wait_for_timeout(250)
                page.keyboard.type(valeur, delay=85)
            scene(3, lambda: champ("Téléphone", APRES["telephone"]))
            scene(4, lambda: champ("E-mail (reçoit les demandes)", APRES["email"]))

            def publier():
                aller(page.get_by_role("button", name="Publier").first, clic=True); page.wait_for_timeout(700)
                aller(page.get_by_text("Publier maintenant").first, clic=True); page.wait_for_timeout(1800)
            scene(5, publier)
        else:
            page.goto(SITE + "/"); page.wait_for_load_state("networkidle")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)"); page.wait_for_timeout(400)
            t0[0] = time.time()
            scene(0, lambda: bandeau(page, "Mise en ligne automatique…", "environ 1 minute (accélérée dans cette vidéo)", barre=True))

            def actualiser():
                page.wait_for_timeout(300)
                page.reload(); page.wait_for_load_state("networkidle")
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)"); page.wait_for_timeout(900)
                surligner(page, ".pied a[href^='mailto:'], .pied a[href^='tel:']")
                aller(".pied a[href^='tel:']"); page.wait_for_timeout(400)
                loupe(page, "✓ Après : déjà en ligne", "#2f9e44"); page.wait_for_timeout(600); aller(".pied a[href^='mailto:']")
            scene(1, actualiser)
            scene(2, lambda: bandeau(page, "Votre site, vos informations : vous gardez la main.", "Ananse · ananse.fr"))
            page.wait_for_timeout(800)
        total = time.time() - t0[0]
        chemin = page.video.path()
        ctx.close(); nav.close()
    return Path(chemin), debuts, total


def monter(partie):
    TMP.mkdir(parents=True, exist_ok=True)
    textes = SCENES[partie]
    (TMP / partie).mkdir(exist_ok=True)
    mp3 = asyncio.run(voix(textes, VOIX, TMP / partie))
    durees = [duree(f) for f in mp3]
    webm, debuts, total = enregistrer(partie, durees)
    # La vidéo Playwright commence à l'ouverture de la page : on coupe ce qui précède la 1re scène.
    avance = duree(webm) - total
    entrees, filtres = ["-ss", f"{avance:.2f}", "-i", str(webm)], []
    for i, f in enumerate(mp3):
        entrees += ["-i", str(f)]
        ms = int(debuts[i] * 1000)
        filtres.append(f"[{i + 1}:a]adelay={ms}|{ms}[a{i}]")
    filtres.append("".join(f"[a{i}]" for i in range(len(mp3))) + f"amix=inputs={len(mp3)}:normalize=0,apad[voix]")
    sortie = TMP / f"partie-{partie}.mp4"
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", *entrees, "-filter_complex", ";".join(filtres),
                    "-map", "0:v", "-map", "[voix]", "-t", f"{total:.2f}",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-r", "25",
                    "-c:a", "aac", "-b:a", "96k", "-ar", "24000", str(sortie)], check=True)
    (TMP / f"partie-{partie}.json").write_text(json.dumps({"debuts": debuts, "durees": durees, "total": duree(sortie)}), encoding="utf-8")
    print(f"partie {partie} : {total:.1f} s")


def assembler():
    SORTIE.mkdir(parents=True, exist_ok=True)
    liste = TMP / "liste.txt"
    liste.write_text("".join(f"file '{(TMP / f'partie-{p}.mp4').as_posix()}'\n" for p in "ab"), encoding="utf-8")
    mp4 = SORTIE / "cms-fr.mp4"
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(liste), "-c", "copy", "-movflags", "+faststart", str(mp4)], check=True)
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", "2", "-i", str(mp4), "-frames:v", "1", "-q:v", "4", str(SORTIE / "cms-fr.jpg")], check=True)
    for lang, textes in (("fr", SCENES), ("en", SOUS_TITRES_EN)):
        sous_titres(lang, textes)
    print(f"vidéo : {duree(mp4):.1f} s, {mp4.stat().st_size // 1024} Ko")


def sous_titres(lang, textes):
    ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{s % 60:06.3f}"
    lignes, n, decalage = ["WEBVTT", ""], 0, 0.0
    for p in "ab":
        d = json.loads((TMP / f"partie-{p}.json").read_text(encoding="utf-8"))
        for i, t in enumerate(textes[p]):
            n += 1
            debut = decalage + d["debuts"][i]
            lignes += [str(n), f"{ts(debut)} --> {ts(debut + d['durees'][i])}", t, ""]
        decalage += d["total"]
    (SORTIE / f"cms-{lang}.vtt").write_text("\n".join(lignes), encoding="utf-8")


if __name__ == "__main__":
    partie = sys.argv[1]
    if partie == "assembler":
        sys.exit(assembler())
    attendu = AVANT if partie == "a" else APRES
    html = lire(SITE + "/")
    if attendu["telephone"] not in html or attendu["email"] not in html:
        sys.exit(f"Le site n'affiche pas encore {attendu} : partie {partie} impossible.")
    monter(partie)
    if partie == "b":
        assembler()
