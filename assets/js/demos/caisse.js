(() => {
  let ticket = [], jour = stock.lire("caisse-jour", { n: 0, especes: 0, carte: 0 });
  const total = () => ticket.reduce((s, l) => s + l.q * l.p, 0);
  function maj() {
    const ul = $("[data-lignes-caisse]"); ul.replaceChildren();
    ticket.forEach((l, k) => {
      const li = document.createElement("li");
      li.append(Object.assign(document.createElement("span"), { textContent: `${l.q} × ${l.nom}` }));
      const d = document.createElement("span"); d.textContent = euros(l.q * l.p, 2) + " ";
      const x = Object.assign(document.createElement("button"), { type: "button", textContent: "−", title: T("Retirer un", "Remove one") });
      x.onclick = () => { if (--l.q <= 0) ticket.splice(k, 1); maj(); };
      d.append(x); li.append(d); ul.append(li);
    });
    $("[data-total-caisse]").textContent = euros(total(), 2);
    $("[data-no-ticket]").textContent = "n° " + (jour.n + 1);
    $("[data-journee]").textContent = T(`${jour.n} ticket(s) · espèces ${euros(jour.especes, 2)} · carte ${euros(jour.carte, 2)} · total ${euros(jour.especes + jour.carte, 2)}`, `${jour.n} ticket(s) · cash ${euros(jour.especes, 2)} · card ${euros(jour.carte, 2)} · total ${euros(jour.especes + jour.carte, 2)}`);
    majRendu();
  }
  function majRendu() {
    const r = +$("[data-recu]").value - total();
    $("[data-rendu]").textContent = $("[data-recu]").value ? (r >= 0 ? T(`À rendre : ${euros(r, 2)}`, `Change: ${euros(r, 2)}`) : T(`Il manque ${euros(-r, 2)}`, `${euros(-r, 2)} missing`)) : "";
  }
  function encaisser(mode) {
    const t = total();
    jour.n++; jour[mode] += t; stock.ecrire("caisse-jour", jour);
    const ok = $("[data-ok-caisse]"); ok.hidden = false;
    ok.textContent = T(`✅ Ticket encaissé : ${euros(t, 2)} (${mode === "carte" ? "carte" : "espèces"}).`, `✅ Paid: ${euros(t, 2)} (${mode === "carte" ? "card" : "cash"}).`);
    ticket = []; $("[data-especes]").hidden = true; $("[data-recu]").value = ""; maj();
  }
  $$("[data-produits-caisse] button").forEach((b) => (b.onclick = () => {
    $("[data-ok-caisse]").hidden = true;
    const l = ticket.find((x) => x.nom === b.dataset.nom);
    if (l) l.q++; else ticket.push({ nom: b.dataset.nom, p: +b.dataset.prix, q: 1 });
    maj();
  }));
  $$("[data-payer-caisse]").forEach((b) => (b.onclick = () => {
    if (!total()) return toast(T("Le ticket est vide", "The ticket is empty"));
    if (b.dataset.payerCaisse === "carte") return encaisser("carte");
    $("[data-especes]").hidden = false; $("[data-recu]").focus();
  }));
  $("[data-recu]").oninput = majRendu;
  $$("[data-billet]").forEach((b) => (b.onclick = () => { $("[data-recu]").value = b.dataset.billet; majRendu(); }));
  $("[data-valider-especes]").onclick = () => { if (+$("[data-recu]").value < total()) return toast(T("Somme insuffisante", "Not enough money")); encaisser("especes"); };
  $("[data-annuler-caisse]").onclick = () => { ticket = []; $("[data-especes]").hidden = true; maj(); };
  $("[data-raz-caisse]").onclick = () => { jour = { n: 0, especes: 0, carte: 0 }; stock.ecrire("caisse-jour", jour); maj(); };
  maj();
})();
