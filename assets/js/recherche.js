// Moteur de recherche des démos : index chargé à la première ouverture, sans accents ni fautes de frappe gênantes,
// synonymes (resto, rdv, cb…), filtres par catégorie, navigation au clavier et « Je veux ça » dans les résultats.
(() => {
  const EN = document.documentElement.lang === "en";
  const T = (fr, en) => (EN ? en : fr);
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/œ/g, "oe").replace(/[^a-z0-9]+/g, " ").trim();
  const mots = (s) => norm(s).split(" ").filter(Boolean);
  const VIDES = new Set("le la les l de des du d un une et ou a au aux pour mon ma mes votre vos avec en sur sans qui que je veux voudrais site the an of for my to and with in on i want".split(" "));

  // Synonymes : chaque mot tapé cherche aussi ces mots-là.
  const SYN = {};
  const groupe = (cles, cibles) => cles.split(" ").forEach((c) => (SYN[c] = (SYN[c] || []).concat(cibles.split(" "))));
  groupe("resto restau restaurant restaurants brasserie pizzeria", "restaurant restaurants food truck menu table");
  groupe("bar cafe buvette snack", "restaurant buvette caisse menu");
  groupe("immo agence agent", "immobilier agences annonces biens");
  groupe("appart appartement maison logement bien biens", "immobilier annonces bailleur logement");
  groupe("location louer loyer locataire proprio proprietaire bailleur landlord tenant rent", "bailleur bailleurs loyer quittance locataire rent landlord");
  groupe("asso club benevole", "association associations benevoles");
  groupe("payer paiement cb carte bancaire stripe paypal sumup pay payment", "paiement payment boutique caisse");
  groupe("acheter vendre vente ecommerce shop boutique magasin", "boutique paiement shop");
  groupe("jeu jeux game games fun ludique concours", "jeux games quiz memory roue arcade grattage");
  groupe("video videos youtube vimeo film", "video videos");
  groupe("photo photos image images", "galerie photos instagram avant");
  groupe("insta", "instagram");
  groupe("fb", "facebook");
  groupe("twitter tweet", "x posts");
  groupe("rdv rendezvous reservation reserver booking book", "rendez reservation reserver booking agenda table");
  groupe("map maps plan adresse itineraire gps", "carte map");
  groupe("mail email courriel contact contacter", "email formulaire contact ecrivez");
  groupe("tel telephone appel appeler sms whatsapp phone call", "appel appeler whatsapp call");
  groupe("agenda calendrier evenement evenements date dates event events calendar", "agenda evenements disponibilites calendar");
  groupe("pdf document documents facture devis quote", "pdf documents quittance devis");
  groupe("commande commander emporter takeaway livraison delivery", "emporter commande livraison takeaway delivery");
  groupe("caisse till pos encaisser", "caisse till");
  groupe("avis note notes etoiles reviews", "avis reviews");
  groupe("stats statistiques audience analytics visiteurs", "statistiques stats");
  groupe("langue langues anglais traduction english translation", "multilingue langues multilingual");
  groupe("360 visite tour virtuelle virtual", "360 visite tour");
  groupe("news newsletter lettre", "newsletter lettre");
  groupe("chat messagerie discussion", "chat discussion");
  groupe("promo reduction remise discount code", "roue grattage bon cadeau compte rebours bandeau");

  const lev1 = (a, b) => { // distance d'édition ≤ 1 ?
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, diff = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return diff + (a.length - i) + (b.length - j) <= 1;
  };

  let index = null, chargement = null, dlg, champ, liste, puces, info, filtre = "", actif = -1, resultats = [];

  const charger = () => chargement || (chargement = fetch(document.body.dataset.index).then((r) => r.json()).then((docs) => {
    index = docs.map((d) => ({ ...d, champs: [[mots(d.titre), 5], [mots(d.accroche), 3], [mots(d.cat + " " + d.metiers.join(" ")), 2], [mots(d.services), 2], [mots(d.texte), 1]] }));
  }));

  function noter(doc, termes, tous) {
    let total = 0, trouves = 0;
    for (const t of termes) {
      const variantes = [t, ...(SYN[t] || [])];
      let meilleur = 0;
      for (const [liste, poids] of doc.champs) for (const m of liste) for (const v of variantes) {
        const exact = v === t ? 1 : .7;
        const s = m === v ? 3 : (v.length >= 2 && m.startsWith(v)) ? 2 : (v.length >= 5 && m.length >= 4 && lev1(m, v)) ? 1 : 0;
        if (s) meilleur = Math.max(meilleur, s * poids * exact);
      }
      if (meilleur) { total += meilleur; trouves++; }
    }
    return (tous ? trouves === termes.length : trouves > 0) ? total + trouves * 10 : 0;
  }

  function surligner(texte, termes) {
    const variantes = termes.flatMap((t) => [t, ...(SYN[t] || [])]);
    const frag = document.createDocumentFragment();
    texte.split(/(\s+)/).forEach((morceau) => {
      const n = norm(morceau);
      const ok = n && variantes.some((v) => n === v || (v.length >= 2 && n.startsWith(v)) || (v.length >= 5 && lev1(n, v)));
      frag.append(ok ? Object.assign(document.createElement("mark"), { textContent: morceau }) : morceau);
    });
    return frag;
  }

  function chercher() {
    const termes = mots(champ.value).filter((m) => !VIDES.has(m));
    let docs = index.filter((d) => !filtre || d.catId === filtre), approche = false;
    if (termes.length) {
      let notes = docs.map((d) => [d, noter(d, termes, true)]).filter(([, s]) => s);
      if (!notes.length) { notes = docs.map((d) => [d, noter(d, termes, false)]).filter(([, s]) => s); approche = notes.length > 0; }
      docs = notes.sort((a, b) => b[1] - a[1]).map(([d]) => d);
    }
    resultats = docs; actif = docs.length ? 0 : -1;
    afficher(termes, approche);
  }

  function afficher(termes, approche) {
    const choix = (window.stock && window.stock.lire("choix", {})) || {};
    liste.replaceChildren();
    resultats.slice(0, 40).forEach((d, i) => {
      const li = document.createElement("li");
      li.className = "rech__res"; li.id = "rech-" + i; li.setAttribute("role", "option");
      li.innerHTML = `<a class="rech__lien"><span class="rech__emoji" aria-hidden="true"></span><span><strong></strong><span class="rech__accroche"></span><small></small></span></a><label class="choix choix--petit"><input type="checkbox"> <span></span></label>`;
      const a = li.querySelector("a"); a.href = d.url;
      li.querySelector(".rech__emoji").textContent = d.emoji;
      li.querySelector("strong").append(surligner(d.titre, termes), d.etoile ? "*" : "");
      li.querySelector(".rech__accroche").append(surligner(d.accroche, termes));
      li.querySelector("small").textContent = d.cat;
      const c = li.querySelector("input"); c.dataset.choix = d.id; c.checked = d.id in choix;
      li.querySelector("label span").textContent = T("Je veux ça", "I want this");
      li.addEventListener("mousemove", () => activer(i, false));
      liste.append(li);
    });
    const n = resultats.length;
    info.textContent = !termes.length && !filtre ? T(`${n} fonctions à découvrir`, `${n} features to explore`)
      : n ? (approche ? T(`Pas de résultat exact : ${n} fonction(s) approchante(s)`, `No exact match: ${n} related feature(s)`) : T(`${n} résultat(s)`, `${n} result(s)`))
      : T("Aucun résultat. Essayez un autre mot, ou demandez-nous directement : tout est possible !", "No results. Try another word, or just ask us: anything is possible!");
    activer(actif, false);
  }

  function activer(i, defiler = true) {
    actif = i;
    $$r(".rech__res").forEach((li, k) => li.classList.toggle("actif", k === i));
    champ.setAttribute("aria-activedescendant", i >= 0 ? "rech-" + i : "");
    if (defiler && i >= 0) liste.children[i]?.scrollIntoView({ block: "nearest" });
  }
  const $$r = (s) => [...dlg.querySelectorAll(s)];

  function construire() {
    dlg = document.createElement("dialog");
    dlg.className = "rech";
    dlg.setAttribute("aria-label", T("Rechercher une fonction", "Search a feature"));
    dlg.innerHTML = `
      <div class="rech__tete">
        <span aria-hidden="true">🔍</span>
        <input type="search" role="combobox" aria-expanded="true" aria-controls="rech-liste" autocomplete="off" spellcheck="false">
        <button type="button" class="rech__fermer" aria-label="${T("Fermer", "Close")}">Échap</button>
      </div>
      <div class="rech__puces"></div>
      <p class="rech__info" role="status"></p>
      <ul class="rech__liste" id="rech-liste" role="listbox"></ul>
      <p class="rech__aide">${T("↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer", "↑ ↓ to choose · Enter to open · Esc to close")}</p>`;
    document.body.append(dlg);
    champ = dlg.querySelector("input"); liste = dlg.querySelector("ul"); puces = dlg.querySelector(".rech__puces"); info = dlg.querySelector(".rech__info");
    champ.placeholder = T("ex. réservation, carte, jeu, paiement, resto…", "e.g. booking, map, game, payment, restaurant…");
    dlg.querySelector(".rech__fermer").onclick = () => dlg.close();
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    champ.addEventListener("input", () => index && chercher());
    champ.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); activer(Math.min(resultats.length - 1, actif + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); activer(Math.max(0, actif - 1)); }
      if (e.key === "Enter" && actif >= 0) { e.preventDefault(); location.href = resultats[actif].url; }
    });
    const cats = [];
    const ajouterPuce = (id, texte) => {
      const b = Object.assign(document.createElement("button"), { type: "button", className: "d-puce", textContent: texte });
      b.setAttribute("aria-pressed", String(id === filtre));
      b.onclick = () => { filtre = filtre === id ? "" : id; $$r(".rech__puces button").forEach((x) => x.setAttribute("aria-pressed", String(x === b && filtre !== ""))); chercher(); champ.focus(); };
      puces.append(b);
    };
    return charger().then(() => {
      index.forEach((d) => { if (!cats.find((c) => c[0] === d.catId)) cats.push([d.catId, `${d.emoji} ${d.cat}`]); });
      cats.forEach(([id, t]) => ajouterPuce(id, t));
    });
  }

  let pret = null;
  async function ouvrir(texte) {
    if (!dlg) pret = construire();
    if (!dlg.open) dlg.showModal();
    if (typeof texte === "string") champ.value = texte;
    champ.focus();
    info.textContent = T("Chargement…", "Loading…");
    await pret;
    chercher();
  }
  window.ouvrirRecherche = ouvrir;

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ouvrir-recherche]");
    if (b) { e.preventDefault(); ouvrir(b.dataset.q); }
  });
  document.addEventListener("keydown", (e) => {
    const saisie = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !saisie)) { e.preventDefault(); ouvrir(); }
  });
  // Précharge l'index quand le visiteur approche du champ (survol ou focus) : l'ouverture est alors instantanée.
  document.querySelectorAll("[data-ouvrir-recherche]").forEach((b) => ["pointerenter", "focus"].forEach((ev) => b.addEventListener(ev, charger, { once: true })));
})();
