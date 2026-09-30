(() => {
  let onglet = "adhesion", don = 20;
  $$("[data-o]").forEach((b) => (b.onclick = () => { onglet = b.dataset.o; $$("[data-o]").forEach((x) => x.setAttribute("aria-pressed", x === b)); $$("[data-panneau]").forEach((p) => (p.hidden = p.dataset.panneau !== onglet)); }));
  const red = () => ($("[data-reduction]").textContent = T(`Si votre association est éligible, ce don ne coûte que ${euros(don * .34, 2)} après réduction d'impôt de 66 %.`, `If the organisation is eligible (France), this gift only costs ${euros(don * .34, 2)} after the 66% tax reduction.`));
  $$("[data-d]").forEach((b) => (b.onclick = () => { don = +b.dataset.d; $$("[data-d]").forEach((x) => x.setAttribute("aria-pressed", x === b)); red(); }));
  red();
  $("[data-asso-payer]").onclick = () => { const m = onglet === "don" ? don : +$("input[name=formule]:checked").value; const ok = $("[data-asso-ok]"); ok.hidden = false; ok.textContent = T(`🎭 Ici, paiement de ${euros(m)} sur HelloAsso, puis reçu envoyé automatiquement par e-mail.`, `🎭 Here: payment of ${euros(m)} on HelloAsso, then a receipt is emailed automatically.`); };
})();
