(() => {
  const i = Object.fromEntries($$("[data-i]").map((x) => [x.dataset.i, x]));
  const calc = () => { const l = +i.loyer.value, n = l * +i.nouveau.value / (+i.ancien.value || 1); return { l, n, h: n - l, p: (n / l - 1) * 100 }; };
  const maj = () => {
    const { n, h, p } = calc();
    $("[data-nouveau-loyer]").textContent = euros(n, 2) + T(" / mois", " / month");
    $("[data-hausse]").textContent = T(`Soit ${euros(h, 2)} de plus par mois (${nombre(p, 2)} %).`, `That's ${euros(h, 2)} more per month (${nombre(p, 2)}%).`);
  };
  Object.values(i).forEach((x) => x.addEventListener("input", maj)); maj();

  const d = new Date(); d.setMonth(d.getMonth() + 1, 1);
  $("[data-date-effet]").value = d.toISOString().slice(0, 10);

  $("[data-courrier]").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target)), { l, n, h, p } = calc(), lang = document.documentElement.lang;
    const effet = new Date(v.effet).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" }).replace(/^1 /, lang === "fr" ? "1er " : "1 ");
    const auj = new Date().toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" });
    const pdf = MiniPDF(), bleu = "#1F6FB2";
    pdf.rect(0, 0, pdf.W, 26, { fond: "#C62828" });
    pdf.centre(17, T("DOCUMENT DE DÉMONSTRATION — NE PAS ENVOYER TEL QUEL", "DEMO DOCUMENT — DO NOT SEND AS IS"), { taille: 9, gras: true, couleur: "#FFFFFF" });
    pdf.texte(50, 70, v.bailleur, { gras: true }); pdf.texte(50, 86, T("Propriétaire bailleur", "Landlord"), { taille: 10, couleur: "#555555" });
    pdf.texte(340, 120, v.locataire, { gras: true }); pdf.paragraphe(340, 136, v.adresse, 210, { taille: 10 });
    pdf.texte(340, 180, T(`Le ${auj}`, auj), { taille: 10 });
    pdf.texte(50, 220, T("Objet : révision annuelle de votre loyer", "Subject: annual review of your rent"), { gras: true, taille: 12, couleur: bleu });
    let y = 252;
    y = pdf.paragraphe(50, y, T("Madame, Monsieur,", "Dear tenant,"), 495) + 6;
    y = pdf.paragraphe(50, y, T(
      "Votre bail prévoit une révision annuelle du loyer. La loi l'autorise expressément : l'article 17-1 de la loi n° 89-462 du 6 juillet 1989 permet d'ajuster le loyer une fois par an, à la date prévue au bail, selon l'évolution de l'Indice de Référence des Loyers (IRL) publié chaque trimestre par l'INSEE. Cet indice suit l'évolution des prix à la consommation, et sa hausse est encadrée pour protéger les locataires.",
      "Your lease provides for an annual rent review. French law expressly allows it: article 17-1 of law no. 89-462 of 6 July 1989 lets the rent be adjusted once a year, on the date set in the lease, in line with the Rent Reference Index (IRL) published each quarter by INSEE. The index follows consumer prices, and its rise is capped to protect tenants."), 495) + 8;
    pdf.rect(50, y - 4, 495, 118, { fond: "#EEF4FA" });
    const lignes = [[T("Loyer actuel hors charges", "Current rent excl. charges"), euros(l, 2)], [T(`IRL de référence du bail (${v.trimestre})`, `Lease reference IRL (${v.trimestre})`), nombre(+i.ancien.value, 2)], [T(`Nouvel IRL (${v.trimestre}, un an après)`, `New IRL (${v.trimestre}, one year later)`), nombre(+i.nouveau.value, 2)], [T("Calcul : loyer × nouvel IRL ÷ ancien IRL", "Formula: rent × new IRL ÷ old IRL"), ""], [T("Nouveau loyer hors charges", "New rent excl. charges"), euros(n, 2)]];
    lignes.forEach(([a, b], k) => { const g = k === 4; pdf.texte(62, y + 14 + k * 21, a, { gras: g, taille: g ? 12 : 11 }); if (b) pdf.droite(533, y + 14 + k * 21, b, { gras: g, taille: g ? 12 : 11 }); });
    y += 136;
    y = pdf.paragraphe(50, y, T(
      `À compter du ${effet}, votre loyer hors charges sera donc de ${euros(n, 2)} par mois, soit ${euros(h, 2)} de plus qu'aujourd'hui (+${nombre(p, 2)} %). Les charges restent inchangées. Cette révision ne modifie aucune autre condition de votre bail.`,
      `From ${effet}, your rent excluding charges will therefore be ${euros(n, 2)} per month, ${euros(h, 2)} more than today (+${nombre(p, 2)}%). Charges stay the same. This review changes no other term of your lease.`), 495) + 8;
    y = pdf.paragraphe(50, y, T("Je reste bien entendu à votre disposition pour toute question, et vous remercie de votre confiance.", "I remain at your disposal for any question, and thank you for your trust."), 495) + 6;
    y = pdf.paragraphe(50, y, T("Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.", "Yours sincerely,"), 495);
    pdf.texte(340, y + 30, v.bailleur, { gras: true });
    pdf.paragraphe(50, 790, T("Document de démonstration créé par « Ce qu'on peut faire avec le web statique » (Ananse). Les indices sont des exemples : vérifiez les valeurs officielles sur insee.fr et les clauses de votre bail avant tout envoi.", "Demo document made by “What you can do with the static web” (Ananse). Indices are examples: check official values on insee.fr and your lease terms before sending."), 495, { taille: 8, couleur: "#C62828" });
    pdf.telecharger(T("courrier-revision-loyer.pdf", "rent-review-letter.pdf"));
  });
})();
