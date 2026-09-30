(() => {
  const jours = $("[data-jours]"), heures = $("[data-heures]"), btn = $("[data-reserver]"), ok = $("[data-ok]");
  let jour = null, heure = null;
  const d = new Date();
  const liste = [];
  while (liste.length < 5) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) liste.push(new Date(d)); }
  const fmt = (x) => x.toLocaleDateString(document.documentElement.lang, { weekday: "short", day: "numeric", month: "short" });
  liste.forEach((x, i) => {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: fmt(x) });
    b.onclick = () => { jour = x; $$("button", jours).forEach((y) => y.setAttribute("aria-pressed", y === b)); creneaux(i); };
    jours.append(b);
  });
  function creneaux(i) {
    heures.replaceChildren(); heure = null; btn.disabled = true;
    ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"].forEach((h, k) => {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: h });
      if ((k + i) % 4 === 1) { b.disabled = true; b.style.opacity = .4; b.title = T("Déjà réservé", "Already booked"); }
      b.onclick = () => { heure = h; $$("button", heures).forEach((y) => y.setAttribute("aria-pressed", y === b)); btn.disabled = false; };
      heures.append(b);
    });
  }
  btn.onclick = () => { ok.hidden = false; ok.textContent = T(`✅ Rendez-vous confirmé le ${fmt(jour)} à ${heure}. Un e-mail de confirmation partirait au client et à vous.`, `✅ Appointment confirmed on ${fmt(jour)} at ${heure}. A confirmation email would go to the customer and to you.`); };
})();
