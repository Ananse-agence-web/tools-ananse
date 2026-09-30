(() => {
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const index = $$("[data-index] li").map((li) => ({ ...li.dataset, n: norm(li.dataset.titre + " " + li.dataset.texte) }));
  const champ = $("[data-recherche]"), res = $("[data-resultats]"), nb = $("[data-nb]");
  champ.addEventListener("input", () => {
    const mots = norm(champ.value).split(/\s+/).filter(Boolean);
    res.replaceChildren();
    if (!mots.length) { nb.textContent = ""; return; }
    const trouves = index.filter((p) => mots.every((m) => p.n.includes(m))).slice(0, 12);
    nb.textContent = T(`${trouves.length} résultat(s)`, `${trouves.length} result(s)`);
    for (const p of trouves) { const li = document.createElement("li"); const a = document.createElement("a"); a.href = p.url; a.textContent = p.titre; li.append(a); res.append(li); }
  });
})();
