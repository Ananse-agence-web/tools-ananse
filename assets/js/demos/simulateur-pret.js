(() => {
  const p = Object.fromEntries($$("[data-p]").map((e) => [e.dataset.p, e]));
  const maj = () => {
    const prix = +p.prix.value, frais = prix * (p.neuf.value === "1" ? .025 : .075), n = +p.duree.value * 12, r = +p.taux.value / 100 / 12;
    const emprunt = Math.max(0, prix + frais - +p.apport.value), m = r ? emprunt * r / (1 - Math.pow(1 + r, -n)) : emprunt / n;
    $("[data-duree]").textContent = p.duree.value + T(" ans", " years");
    $("[data-mensualite]").textContent = euros(m) + T(" / mois", " / month");
    const t = $("[data-detail]"); t.replaceChildren();
    for (const [a, b] of [[T("Frais de notaire", "Notary fees"), frais], [T("Montant emprunté", "Loan amount"), emprunt], [T("Coût du crédit", "Interest cost"), m * n - emprunt]]) { const tr = t.insertRow(); tr.insertCell().textContent = a; tr.insertCell().textContent = euros(b); }
  };
  Object.values(p).forEach((e) => e.addEventListener("input", maj)); maj();
})();
