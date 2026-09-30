(() => {
  const g = $("[data-grille]"), titre = $("[data-titre]"), lang = document.documentElement.lang;
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  let m = new Date(auj.getFullYear(), auj.getMonth(), 1);
  const pris = (d) => { const n = d.getDate() + d.getMonth() * 31; return n % 7 === 2 || n % 7 === 3 || n % 11 === 0 || (n % 13 > 9); };
  function dessiner() {
    titre.textContent = m.toLocaleDateString(lang, { month: "long", year: "numeric" });
    g.replaceChildren();
    const noms = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "narrow" }));
    noms.forEach((n) => g.append(Object.assign(document.createElement("span"), { className: "ent", textContent: n })));
    const dec = (m.getDay() + 6) % 7;
    for (let i = 0; i < dec; i++) g.append(document.createElement("span"));
    const fin = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let j = 1; j <= fin; j++) {
      const d = new Date(m.getFullYear(), m.getMonth(), j);
      const s = Object.assign(document.createElement("span"), { textContent: j });
      s.className = d < auj ? "passe" : pris(d) ? "pris" : "j";
      g.append(s);
    }
  }
  $$("[data-mois]").forEach((b) => (b.onclick = () => { m = new Date(m.getFullYear(), m.getMonth() + +b.dataset.mois, 1); dessiner(); }));
  dessiner();
})();
