(() => {
  const lang = document.documentElement.lang;
  // 0 = lundi … 6 = dimanche ; créneaux [début, fin] en heures
  const H = [[[9, 12.5], [14, 19]], [[9, 12.5], [14, 19]], [[9, 12.5]], [[9, 12.5], [14, 19]], [[9, 12.5], [14, 20]], [[9, 18]], []];
  const nomJour = (i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "long" });
  const h = (x) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`;
  const sel = $("[data-jour]"), heure = $("[data-heure]");
  for (let i = 0; i < 7; i++) sel.append(new Option(nomJour(i), i));
  const now = () => { const d = new Date(); sel.value = (d.getDay() + 6) % 7; heure.value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; maj(); };
  function maj() {
    const j = +sel.value, [hh, mm] = heure.value.split(":").map(Number), t = hh + mm / 60;
    const tab = $("[data-horaires]"); tab.replaceChildren();
    H.forEach((c, i) => { const tr = tab.insertRow(); if (i === j) tr.className = "auj"; tr.insertCell().textContent = nomJour(i); tr.insertCell().textContent = c.length ? c.map(([a, b]) => `${h(a)} – ${h(b)}`).join(" · ") : T("Fermé", "Closed"); });
    const s = $("[data-statut]"), ouvert = H[j].find(([a, b]) => t >= a && t < b);
    if (ouvert) { s.className = "statut ouvert"; s.textContent = T(`● Ouvert · ferme à ${h(ouvert[1])}`, `● Open · closes at ${h(ouvert[1])}`); return; }
    let k = j, x = t;
    for (let n = 0; n < 8; n++) { const p = H[k].find(([a]) => a > x); if (p) { s.className = "statut ferme"; s.textContent = T(`● Fermé · ouvre ${n === 0 ? "aujourd'hui" : n === 1 ? "demain" : nomJour(k)} à ${h(p[0])}`, `● Closed · opens ${n === 0 ? "today" : n === 1 ? "tomorrow" : nomJour(k)} at ${h(p[0])}`); return; } k = (k + 1) % 7; x = -1; }
  }
  sel.onchange = heure.oninput = maj; $("[data-maintenant]").onclick = now; now();
})();
