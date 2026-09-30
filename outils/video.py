# Fabrique la vidéo de présentation du site (FR et EN) :
#   1. voix de synthèse par scène (edge-tts),
#   2. navigation enregistrée dans le vrai site (Playwright),
#   3. montage vidéo + voix + sous-titres (ffmpeg).
#
# Prérequis : pip install playwright edge-tts imageio-ffmpeg ; playwright install chromium
# Usage : construire le site puis le servir, par exemple
#   hugo --baseURL http://localhost:1415/ -d _apercu && python -m http.server 1415 -d _apercu
#   python outils/video.py            (écrit static/video/presentation-fr|en.mp4/.jpg/.vtt)

import asyncio, json, re, shutil, subprocess, sys, tempfile, time
from pathlib import Path

import edge_tts
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

BASE = "http://localhost:1415"
SORTIE = Path(__file__).resolve().parent.parent / "static" / "video"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 1280, 720

TEXTES = {
    "fr": {
        "voix": "fr-FR-DeniseNeural", "prefixe": "", "devis": "/devis/",
        "commentaire": "Pour l'ouverture en juin !", "nom": "Camille",
        "fin": "Ananse · On tisse votre web",
        "scenes": [
            "Bonjour ! Bienvenue sur « Ce qu'on peut faire avec le static », le site de démonstration d'Ananse.",
            "Chaque site que nous créons s'affiche en moins d'une seconde, est parfait sur téléphone, et ne dépose aucun cookie.",
            "Plus de soixante fonctions sont à essayer, une par page : contact, réseaux sociaux, paiement, réservation, et même des jeux.",
            "Par exemple, une roue de la chance, pour offrir une réduction à vos clients.",
            "Une fonction vous plaît ? Cochez « Je veux ça », et ajoutez un commentaire si vous le souhaitez.",
            "Vous pouvez aussi essayer nos couleurs, en mode clair ou sombre.",
            "Enfin, ouvrez « Mon devis » : votre liste est prête. Il ne reste qu'à l'envoyer, en un clic.",
            "Ananse. On tisse votre web. Parlons de votre projet !",
        ],
    },
    "en": {
        "voix": "en-GB-SoniaNeural", "prefixe": "/en", "devis": "/en/quote/",
        "commentaire": "For our opening in June!", "nom": "Alex",
        "fin": "Ananse · We weave your web",
        "scenes": [
            "Hello! Welcome to “What you can do with a static site”, the demo website by Ananse.",
            "All our sites load in under a second, look perfect on a phone, and set no cookies.",
            "More than sixty features are ready to try, one per page: contact, social media, payments, bookings, and even games.",
            "For example, a prize wheel, to give your customers a discount.",
            "Like a feature? Tick “I want this”, and add a comment if you wish.",
            "You can also try our colours, in light or dark mode.",
            "Finally, open “My quote”: your list is ready. All that's left is to send it, in one click.",
            "Ananse. We weave your web. Let's talk about your project!",
        ],
    },
}

# Prononciation : le texte écrit (sous-titres) reste « Ananse », la voix dit « Anansi ».
PRONONCIATION = {"Ananse": "Anansi"}


def dit(texte):
    for ecrit, oral in PRONONCIATION.items():
        texte = texte.replace(ecrit, oral)
    return texte


# Curseur visible (Playwright n'enregistre pas celui du système) et choix de départ dans le panier.
INIT = """
(() => {
  try { if (!localStorage.getItem('video-seed')) { localStorage.setItem('choix', JSON.stringify({ 'menu-du-jour': '', 'reservation-table': '', 'carte': '' })); localStorage.setItem('video-seed', '1'); } } catch (e) {}
  addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-4px 0 0 -4px;z-index:99999;pointer-events:none;transition:transform .05s;background:no-repeat url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M3 2l7 19 2.5-7.5L20 11z%27 fill=%27%23111%27 stroke=%27%23fff%27 stroke-width=%271.5%27/%3E%3C/svg%3E");';
    document.body.append(c);
    const pos = JSON.parse(sessionStorage.getItem('curseur') || '[640,360]');
    c.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
    addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; sessionStorage.setItem('curseur', JSON.stringify([e.clientX, e.clientY])); }, true);
    addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      r.style.cssText = `position:fixed;left:${e.clientX - 18}px;top:${e.clientY - 18}px;width:36px;height:36px;border-radius:50%;border:3px solid #F2B33D;z-index:99998;pointer-events:none;transition:all .4s;opacity:1`;
      document.body.append(r); requestAnimationFrame(() => { r.style.transform = 'scale(1.8)'; r.style.opacity = '0'; }); setTimeout(() => r.remove(), 450);
    }, true);
  });
})();
"""


def duree(f):
    s = subprocess.run([FFMPEG, "-i", str(f)], capture_output=True, text=True).stderr
    h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", s).groups()
    return int(h) * 3600 + int(m) * 60 + float(sec)


async def voix(textes, voix_id, dossier):
    fichiers = []
    for i, t in enumerate(textes):
        f = dossier / f"voix-{i}.mp3"
        await edge_tts.Communicate(dit(t), voix_id, rate="+4%").save(str(f))
        fichiers.append(f)
    return fichiers


def enregistrer(lang, durees, dossier):
    L = TEXTES[lang]
    debuts = []
    with sync_playwright() as p:
        nav = p.chromium.launch()
        ctx = nav.new_context(viewport={"width": W, "height": H}, color_scheme="light", locale="fr-FR" if lang == "fr" else "en-GB",
                              record_video_dir=str(dossier), record_video_size={"width": W, "height": H})
        ctx.add_init_script(INIT)
        page = ctx.new_page()
        t0 = time.time()

        def aller(sel, clic=False, dy=0):
            el = page.locator(sel).first
            el.scroll_into_view_if_needed()
            b = el.bounding_box()
            page.mouse.move(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2 + dy, steps=28)
            if clic:
                page.wait_for_timeout(150); page.mouse.click(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2 + dy)

        def defiler(y):
            page.evaluate(f"window.scrollTo({{top: {y}, behavior: 'smooth'}})")

        def haut(sel):
            return page.evaluate(f"document.querySelector({json.dumps(sel)}).getBoundingClientRect().top + scrollY - 70")

        def scene(i, actions):
            debut = time.time() - t0
            debuts.append(debut)
            actions()
            reste = debut + durees[i] + 0.45 - (time.time() - t0)
            if reste > 0: page.wait_for_timeout(int(reste * 1000))

        page.goto(BASE + L["prefixe"] + "/"); page.wait_for_load_state("networkidle")
        page.wait_for_timeout(600)
        scene(0, lambda: (page.mouse.move(420, 300, steps=30), page.wait_for_timeout(1500), aller(".hero .bouton")))
        scene(1, lambda: (defiler(haut("#h-bases")), page.wait_for_timeout(1400), page.mouse.move(700, 420, steps=30)))
        scene(2, lambda: (defiler(haut("#demos")), page.wait_for_timeout(2600), defiler(haut("#demos") + 900), page.wait_for_timeout(2200), defiler(haut("#demos") + 1900)))

        def roue():
            page.goto(BASE + L["prefixe"] + "/demos/roue-grattage/"); page.wait_for_load_state("networkidle")
            defiler(haut(".demo")); page.wait_for_timeout(700)
            aller("[data-tourner]", clic=True)
        scene(3, roue)
        page.wait_for_timeout(1200)

        def cocher():
            defiler(haut(".souhait") - 180); page.wait_for_timeout(800)
            aller(".souhait [data-choix]", clic=True); page.wait_for_timeout(500)
            aller(".souhait textarea", clic=True)
            page.keyboard.type(L["commentaire"], delay=55)
        scene(4, cocher)

        def couleurs():
            defiler(0); page.wait_for_timeout(700)
            aller(".theme summary", clic=True); page.wait_for_timeout(500)
            aller('[data-palette-choix="ocean"]', clic=True); page.wait_for_timeout(900)
            aller('[data-mode-choix="sombre"]', clic=True); page.wait_for_timeout(900)
            aller('[data-palette-choix="prune"]', clic=True); page.wait_for_timeout(700)
            aller('[data-palette-choix="ocean"]', clic=True)
        scene(5, couleurs)

        def devis():
            page.mouse.click(900, 600); page.wait_for_timeout(200)
            aller(".nav__devis", clic=True); page.wait_for_load_state("networkidle"); page.wait_for_timeout(700)
            aller('[data-devis] [name="nom"]', clic=True); page.keyboard.type(L["nom"], delay=70)
            page.wait_for_timeout(400); aller('[data-devis] button[type="submit"]')
        scene(6, devis)

        def fin():
            page.goto(BASE + L["prefixe"] + "/"); page.wait_for_load_state("networkidle")
            page.evaluate("""(t) => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:99990;display:grid;place-content:center;gap:18px;text-align:center;background:rgb(20 18 16 / .82);color:#fff;font:700 44px/1.2 system-ui;opacity:0;transition:opacity .8s'; d.innerHTML = '<div style="font-size:80px;color:#F2B33D">✦</div><div></div><div style="font:500 24px system-ui;opacity:.85">ananse.fr</div>'; d.children[1].textContent = t; document.body.append(d); requestAnimationFrame(() => d.style.opacity = 1); }""", L["fin"])
        scene(7, fin)
        page.wait_for_timeout(800)
        total = time.time() - t0
        chemin = page.video.path()
        ctx.close(); nav.close()
    return Path(chemin), debuts, total


def vtt(textes, debuts, durees, f):
    ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{s % 60:06.3f}"
    lignes = ["WEBVTT", ""]
    for i, t in enumerate(textes):
        lignes += [str(i + 1), f"{ts(debuts[i])} --> {ts(debuts[i] + durees[i])}", t, ""]
    f.write_text("\n".join(lignes), encoding="utf-8")


def monter(lang):
    L = TEXTES[lang]
    SORTIE.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        mp3 = asyncio.run(voix(L["scenes"], L["voix"], tmp))
        durees = [duree(f) for f in mp3]
        webm, debuts, total = enregistrer(lang, durees, tmp)
        entrees, filtres = ["-i", str(webm)], []
        for i, f in enumerate(mp3):
            entrees += ["-i", str(f)]
            ms = int(debuts[i] * 1000)
            filtres.append(f"[{i + 1}:a]adelay={ms}|{ms}[a{i}]")
        filtres.append("".join(f"[a{i}]" for i in range(len(mp3))) + f"amix=inputs={len(mp3)}:normalize=0,apad[voix]")
        mp4 = SORTIE / f"presentation-{lang}.mp4"
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", *entrees, "-filter_complex", ";".join(filtres),
                        "-map", "0:v", "-map", "[voix]", "-t", f"{total:.2f}",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-r", "25",
                        "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(mp4)], check=True)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", "1.2", "-i", str(mp4), "-frames:v", "1", "-q:v", "4",
                        str(SORTIE / f"presentation-{lang}.jpg")], check=True)
        vtt(L["scenes"], debuts, durees, SORTIE / f"presentation-{lang}.vtt")
        print(f"{lang}: {total:.1f} s, {mp4.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    for lang in (sys.argv[1:] or ["fr", "en"]):
        monter(lang)
