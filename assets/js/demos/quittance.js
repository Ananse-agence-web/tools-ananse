(() => {
  const f = $("[data-quittance]"), m = $("[data-mois-courant]"), d = new Date();
  m.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f)), lang = document.documentElement.lang;
    const [a, mo] = v.mois.split("-").map(Number), debut = new Date(a, mo - 1, 1), fin = new Date(a, mo, 0);
    const nomMois = debut.toLocaleDateString(lang, { month: "long", year: "numeric" }), dt = (x) => x.toLocaleDateString(lang);
    const total = +v.loyer + +v.charges, p = MiniPDF();
    p.texte(50, 80, T("QUITTANCE DE LOYER", "RENT RECEIPT"), { taille: 24, gras: true, couleur: "#1F6FB2" });
    p.texte(50, 104, nomMois, { taille: 13, couleur: "#555555" });
    let y = 160;
    for (const [l, val] of [[T("Bailleur", "Landlord"), v.bailleur], [T("Locataire", "Tenant"), v.locataire], [T("Logement", "Property"), v.adresse], [T("Période", "Period"), T(`du ${dt(debut)} au ${dt(fin)}`, `from ${dt(debut)} to ${dt(fin)}`)]]) { p.texte(50, y, l, { gras: true }); p.texte(150, y, val); y += 22; }
    y += 20;
    p.rect(50, y - 16, 495, 90, { fond: "#EEF4FA" });
    p.texte(62, y, T("Loyer", "Rent")); p.droite(530, y, euros(+v.loyer, 2));
    p.texte(62, y + 24, T("Charges", "Charges")); p.droite(530, y + 24, euros(+v.charges, 2));
    p.ligne(62, y + 36, 530, y + 36, { couleur: "#1F6FB2" });
    p.texte(62, y + 58, T("Total payé", "Total paid"), { gras: true, taille: 13 }); p.droite(530, y + 58, euros(total, 2), { gras: true, taille: 13 });
    y += 130;
    y = p.paragraphe(50, y, T(`Je soussigné(e) ${v.bailleur}, propriétaire du logement désigné ci-dessus, déclare avoir reçu de ${v.locataire} la somme de ${euros(total, 2)} au titre du loyer et des charges pour la période indiquée, et lui en donne quittance, sous réserve de tous mes droits.`, `I, ${v.bailleur}, owner of the above property, confirm receipt from ${v.locataire} of ${euros(total, 2)} for rent and charges for the stated period.`), 495, { taille: 11 });
    p.texte(330, y + 40, T(`Fait le ${dt(new Date())}`, `Date: ${dt(new Date())}`)); p.texte(330, y + 60, T("Signature :", "Signature:"));
    p.centre(810, T("Document de démonstration · fabriqué dans votre navigateur", "Demo document · made in your browser"), { taille: 8, couleur: "#999999" });
    p.telecharger(T(`quittance-${v.mois}.pdf`, `receipt-${v.mois}.pdf`));
  });
})();
