// Script commun : thème, sélection « Je veux ça », page devis, chrono, installation.
(() => {
  const d = document.documentElement;
  const EN = d.lang === "en";
  window.T = (fr, en) => (EN ? en : fr);
  window.toast = (texte) => {
    const t = document.createElement("div");
    t.className = "d-toast"; t.textContent = texte; t.setAttribute("role", "status");
    document.body.append(t); setTimeout(() => t.remove(), 2600);
  };
  const lire = (cle, defaut) => { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } };
  const ecrire = (cle, val) => { try { localStorage.setItem(cle, typeof val === "string" ? val : JSON.stringify(val)); } catch {} };
  window.stock = { lire, ecrire };

  // ---- Thème : palette + mode ----
  const majTheme = () => {
    document.querySelectorAll("[data-palette-choix]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.paletteChoix === d.dataset.palette)));
    document.querySelectorAll("[data-mode-choix]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.modeChoix === d.dataset.mode)));
  };
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-palette-choix]");
    const m = e.target.closest("[data-mode-choix]");
    if (p) { d.dataset.palette = p.dataset.paletteChoix; ecrire("palette", d.dataset.palette); majTheme(); }
    if (m) { d.dataset.mode = m.dataset.modeChoix; ecrire("mode", d.dataset.mode); majTheme(); }
    const ouvert = document.querySelector(".theme[open]");
    if (ouvert && !e.target.closest(".theme")) ouvert.open = false;
  });
  majTheme();

  // ---- Sélection : { id: "commentaire" } ----
  let choix = lire("choix", {});
  const sauver = () => { ecrire("choix", choix); majCompteurs(); };
  const majCompteurs = () => {
    const n = Object.keys(choix).length;
    document.querySelectorAll("[data-compteur]").forEach((c) => (c.textContent = n));
  };
  const synchroniser = () => {
    document.querySelectorAll("[data-choix]").forEach((c) => (c.checked = c.dataset.choix in choix));
    document.querySelectorAll("[data-commentaire]").forEach((t) => { if (document.activeElement !== t) t.value = choix[t.dataset.commentaire] || ""; });
    majCompteurs();
  };
  document.addEventListener("change", (e) => {
    const c = e.target.closest("[data-choix]");
    if (!c) return;
    const id = c.dataset.choix;
    if (c.checked) { choix[id] = choix[id] || ""; window.toast(T("Ajouté à votre devis ✔", "Added to your quote ✔")); }
    else delete choix[id];
    sauver(); synchroniser(); rendreDevis();
  });
  document.addEventListener("input", (e) => {
    const t = e.target.closest("[data-commentaire]");
    if (!t) return;
    const id = t.dataset.commentaire;
    choix[id] = t.value;
    sauver();
    document.querySelectorAll(`[data-choix="${id}"]`).forEach((c) => (c.checked = true));
    majApercu();
  });
  window.addEventListener("storage", (e) => { if (e.key === "choix") { choix = lire("choix", {}); synchroniser(); rendreDevis(); } });
  window.addEventListener("pageshow", () => { choix = lire("choix", {}); synchroniser(); });
  synchroniser();

  // ---- Page devis ----
  const form = document.querySelector("[data-devis]");
  const liste = document.querySelector("[data-liste]");
  const catalogue = [...document.querySelectorAll("[data-catalogue] li")].map((li) => ({ ...li.dataset }));

  function selection() { return catalogue.filter((f) => f.id in choix); }

  function rendreDevis() {
    if (!liste) return;
    const sel = selection();
    document.querySelector("[data-vide]").hidden = sel.length > 0;
    document.querySelector("[data-vider]").hidden = sel.length === 0;
    liste.replaceChildren();
    let groupe = null, bloc;
    for (const f of sel) {
      if (f.cat !== groupe) {
        groupe = f.cat;
        bloc = document.createElement("div"); bloc.className = "devis__groupe";
        const h = document.createElement("h3"); h.textContent = `${f.emoji} ${f.cat}`;
        bloc.append(h); liste.append(bloc);
      }
      const l = document.createElement("div"); l.className = "devis__ligne";
      l.innerHTML = `<div class="devis__ligne-haut"><a></a><button type="button" class="lien-bouton"></button></div><textarea rows="2"></textarea>`;
      const a = l.querySelector("a"); a.href = f.url; a.textContent = "✔ " + f.titre;
      const b = l.querySelector("button"); b.textContent = T("Retirer", "Remove");
      b.addEventListener("click", () => { delete choix[f.id]; sauver(); rendreDevis(); });
      const t = l.querySelector("textarea"); t.dataset.commentaire = f.id; t.value = choix[f.id] || "";
      t.placeholder = T("Commentaire ou question (jamais de mot de passe)", "Comment or question (never a password)");
      bloc.append(l);
    }
    majApercu();
  }

  function texteEmail() {
    const v = form ? Object.fromEntries(new FormData(form)) : {};
    const sel = selection();
    const L = [];
    L.push(T("Bonjour,", "Hello,"), "");
    L.push(T("Je souhaite un devis pour un site web avec les fonctions suivantes :", "I'd like a quote for a website with the following features:"), "");
    let groupe = null;
    for (const f of sel) {
      if (f.cat !== groupe) { if (groupe) L.push(""); groupe = f.cat; L.push(`■ ${f.cat.toUpperCase()}`); }
      L.push(`   ✔ ${f.titre}`);
      const c = (choix[f.id] || "").trim();
      if (c) L.push(`      → ${c.replace(/\n+/g, " / ")}`);
    }
    if (!sel.length) L.push(T("   (aucune fonction cochée pour l'instant)", "   (no feature ticked yet)"));
    L.push("", T(`Total : ${sel.length} fonction(s)`, `Total: ${sel.length} feature(s)`));
    const pal = document.querySelector(`[data-palette-choix="${d.dataset.palette}"]`);
    L.push(T(`Couleurs préférées : ${pal ? pal.dataset.nom : d.dataset.palette}, mode ${d.dataset.mode}`, `Preferred colours: ${pal ? pal.dataset.nom : d.dataset.palette}, ${({ auto: "auto", clair: "light", sombre: "dark" })[d.dataset.mode]} mode`));
    const fd = form ? new FormData(form) : null, charte = fd ? fd.getAll("charte") : [], logo = fd ? fd.getAll("logo") : [];
    if (charte.length || logo.length) {
      L.push("", T("IDENTITÉ VISUELLE", "BRAND IDENTITY"));
      if (charte.length) L.push(T("Charte graphique : ", "Visual style: ") + charte.join(T(" / ou ", " / or ")));
      if (logo.length) L.push(T("Logo : ", "Logo: ") + logo.join(T(" / ou ", " / or ")));
    }
    if ((v.message || "").trim()) L.push("", T("MON PROJET", "MY PROJECT"), v.message.trim());
    L.push("", T("MES COORDONNÉES", "MY DETAILS"));
    const ligne = (fr, en, val) => { if ((val || "").trim()) L.push(`${T(fr, en)} : ${val.trim()}`); };
    ligne("Nom", "Name", v.nom); ligne("Entreprise", "Business", v.entreprise); ligne("Activité", "Line of work", v.activite);
    ligne("Ville", "Town", v.ville); ligne("Téléphone", "Phone", v.telephone); ligne("Site actuel", "Current site", v.site);
    L.push("", T("Merci et à bientôt,", "Thanks, speak soon,"), (v.nom || "").trim(), "", "—", T("Envoyé depuis « Ce qu'on peut faire avec le static »", "Sent from “What you can do with a static site”"), location.origin + (document.body.dataset.racine || "/"));
    return L.join("\n");
  }

  function majApercu() {
    const pre = document.querySelector("[data-apercu]");
    if (pre) pre.textContent = texteEmail();
  }

  if (form) {
    form.addEventListener("input", majApercu);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form));
      const sujet = T("Demande de devis", "Quote request") + ` — ${v.nom}${v.entreprise ? " (" + v.entreprise + ")" : ""} — ${selection().length} ${T("fonction(s)", "feature(s)")}`;
      const a = Object.assign(document.createElement("a"), { href: `mailto:${document.body.dataset.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(texteEmail())}`, target: "_blank", rel: "noopener" });
      document.body.append(a); a.click(); a.remove();
    });
    document.querySelector("[data-copier]").addEventListener("click", async (e) => {
      try { await navigator.clipboard.writeText(texteEmail()); window.toast(e.currentTarget.dataset.ok); }
      catch { document.querySelector(".apercu").open = true; }
    });
    document.querySelector("[data-vider]").addEventListener("click", () => { choix = {}; sauver(); rendreDevis(); });
    rendreDevis();
  }

  // ---- Liens externes et e-mails : nouvel onglet (y compris les liens ajoutés plus tard par les démos) ----
  const externe = (a) => {
    if (!a.href || a.target) return;
    const u = new URL(a.href, location.href);
    if (u.protocol === "mailto:" || (u.protocol.startsWith("http") && u.origin !== location.origin)) { a.target = "_blank"; a.rel = "noopener"; }
  };
  document.querySelectorAll("a[href]").forEach(externe);
  document.addEventListener("click", (e) => { const a = e.target.closest("a[href]"); if (a) externe(a); }, true);

  // ---- Chrono de chargement (accueil) ----
  const chrono = document.querySelector("[data-chrono]");
  if (chrono) {
    addEventListener("load", () => setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const ms = nav ? nav.loadEventEnd || nav.domComplete : performance.now();
      if (!ms) return;
      chrono.textContent = chrono.dataset.modele.replace("§", (ms / 1000).toLocaleString(d.lang, { maximumFractionDigits: 2, minimumFractionDigits: 2 }));
      chrono.hidden = false;
    }, 0));
  }

  // ---- Installation (PWA) et hors ligne ----
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register((document.body.dataset.racine || "/") + "sw.js").catch(() => {}));
  }
  const installer = document.querySelector("[data-installer]");
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    if (!installer) return;
    installer.hidden = false;
    installer.querySelector("button").onclick = () => { e.prompt(); installer.hidden = true; };
  });
})();
