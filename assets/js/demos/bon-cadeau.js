(() => {
  $("[data-bon]").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target)), p = MiniPDF(), code = "KDO-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const fin = new Date(); fin.setFullYear(fin.getFullYear() + 1);
    p.rect(40, 60, 515, 330, { fond: "#FFF4DC" }); p.rect(40, 60, 515, 330, { contour: "#B8452C", epaisseur: 3 });
    p.rect(40, 60, 515, 70, { fond: "#B8452C" });
    p.centre(105, T("BON CADEAU", "GIFT VOUCHER"), { taille: 26, gras: true, couleur: "#FFFFFF" });
    p.centre(190, euros(+v.montant), { taille: 54, gras: true, couleur: "#B8452C" });
    p.centre(235, T(`Pour ${v.pour}, de la part de ${v.de}`, `For ${v.pour}, from ${v.de}`), { taille: 14, gras: true });
    let y = 262; for (const l of [v.message]) y = p.paragraphe(90, y, "« " + l + " »", 420, { taille: 12, couleur: "#555555" });
    p.centre(340, T(`Code : ${code} · valable jusqu'au ${fin.toLocaleDateString("fr-FR")}`, `Code: ${code} · valid until ${fin.toLocaleDateString("en-GB")}`), { taille: 11 });
    p.centre(368, T("Votre Commerce · 12 rue du Marché", "Your Shop · 12 Market Street"), { taille: 10, couleur: "#777777" });
    p.centre(810, T("Document de démonstration · fabriqué dans votre navigateur", "Demo document · made in your browser"), { taille: 8, couleur: "#999999" });
    p.telecharger(T("bon-cadeau.pdf", "gift-voucher.pdf"));
  });
})();
