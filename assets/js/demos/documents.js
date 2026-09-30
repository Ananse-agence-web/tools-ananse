(() => {
  const docs = {
    menu: { titre: T("Notre carte", "Our menu"), lignes: [[T("Entrées", "Starters"), null], [T("Velouté de potiron", "Pumpkin soup"), "7 €"], [T("Salade de chèvre chaud", "Warm goat's cheese salad"), "9 €"], [T("Plats", "Mains"), null], [T("Lasagnes maison", "Homemade lasagne"), "15 €"], [T("Poisson du jour", "Fish of the day"), "18 €"], [T("Desserts", "Desserts"), null], [T("Tarte au citron", "Lemon tart"), "7 €"], [T("Mousse au chocolat", "Chocolate mousse"), "6 €"]] },
    tarifs: { titre: T("Tarifs 2026", "2026 prices"), lignes: [[T("Prestations", "Services"), null], [T("Coupe femme", "Women's cut"), "38 €"], [T("Coupe homme", "Men's cut"), "24 €"], [T("Couleur", "Colour"), "55 €"], [T("Brushing", "Blow-dry"), "22 €"]] },
    reglement: { titre: T("Règlement du club", "Club rules"), lignes: [[T("Article 1", "Rule 1"), null], [T("La cotisation est due en septembre.", "Membership fees are due in September."), ""], [T("Article 2", "Rule 2"), null], [T("Le matériel est rangé après chaque séance.", "Equipment is put away after each session."), ""], [T("Article 3", "Rule 3"), null], [T("La bonne humeur est obligatoire.", "Good mood is compulsory."), ""]] },
  };
  $$("[data-doc]").forEach((b) => (b.onclick = () => {
    const d = docs[b.dataset.doc], p = MiniPDF();
    p.rect(0, 0, p.W, 110, { fond: "#B8452C" });
    p.texte(50, 70, d.titre, { taille: 28, gras: true, couleur: "#FFFFFF" });
    let y = 160;
    for (const [a, prix] of d.lignes) {
      const sectionTitre = prix === null;
      if (sectionTitre) { y += 10; p.texte(50, y, a, { taille: 15, gras: true, couleur: "#B8452C" }); y += 26; continue; }
      p.texte(60, y, a, { taille: 12 });
      if (prix) { p.droite(545, y, prix, { taille: 12, gras: true }); p.ligne(60, y + 8, 545, y + 8, { couleur: "#DDDDDD", epaisseur: .5 }); }
      y += 26;
    }
    p.centre(800, T("Document de démonstration · fabriqué dans votre navigateur", "Demo document · made in your browser"), { taille: 9, couleur: "#888888" });
    p.telecharger(`${b.dataset.doc}.pdf`);
  }));
})();
