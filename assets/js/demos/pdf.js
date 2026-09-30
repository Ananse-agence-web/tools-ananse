(() => {
  const f = $("[data-devis-pdf]");
  const lignes = () => $$("tbody tr", f).map((tr) => { const [a, q, p] = $$("input", tr); return { nom: a.value, q: +q.value || 0, p: +p.value || 0 }; }).filter((l) => l.nom);
  const total = () => lignes().reduce((s, l) => s + l.q * l.p, 0);
  const maj = () => ($("[data-total]").textContent = T("Total HT : ", "Total excl. VAT: ") + euros(total(), 2));
  f.addEventListener("input", maj); maj();
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = MiniPDF(), date = new Date().toLocaleDateString(document.documentElement.lang);
    p.texte(50, 70, T("DEVIS", "QUOTE"), { taille: 30, gras: true, couleur: "#B8452C" });
    p.texte(50, 95, T(`N° 2026-042 · ${date}`, `No. 2026-042 · ${date}`), { taille: 10, couleur: "#666666" });
    p.texte(360, 70, T("Votre Entreprise", "Your Business"), { taille: 13, gras: true });
    p.texte(360, 88, T("12 rue des Artisans, 31000 Toulouse", "12 Craft Street, Toulouse"), { taille: 9 });
    p.texte(50, 150, T("Client : ", "Customer: ") + new FormData(f).get("client"), { taille: 12, gras: true });
    let y = 200;
    p.rect(50, y - 16, 495, 24, { fond: "#F4EBDD" });
    p.texte(58, y, T("Prestation", "Service"), { gras: true }); p.droite(380, y, T("Qté", "Qty"), { gras: true }); p.droite(460, y, T("Prix", "Price"), { gras: true }); p.droite(537, y, "Total", { gras: true });
    y += 28;
    for (const l of lignes()) {
      p.texte(58, y, l.nom); p.droite(380, y, String(l.q)); p.droite(460, y, euros(l.p, 2)); p.droite(537, y, euros(l.q * l.p, 2));
      p.ligne(50, y + 9, 545, y + 9, { couleur: "#E0E0E0", epaisseur: .5 }); y += 26;
    }
    const ht = total();
    y += 10;
    for (const [lib, v, g] of [[T("Total HT", "Subtotal"), ht], [T("TVA 20 %", "VAT 20%"), ht * .2], [T("Total TTC", "Total"), ht * 1.2, true]]) { p.droite(460, y, lib, { gras: g }); p.droite(537, y, euros(v, 2), { gras: g, taille: g ? 13 : 11 }); y += 20; }
    p.paragraphe(50, y + 40, T("Devis valable 30 jours. Bon pour accord, date et signature :", "Quote valid for 30 days. Approved, date and signature:"), 495, { taille: 10 });
    p.centre(810, T("Document de démonstration · fabriqué dans votre navigateur", "Demo document · made in your browser"), { taille: 8, couleur: "#999999" });
    p.telecharger(T("devis.pdf", "quote.pdf"));
  });
})();
