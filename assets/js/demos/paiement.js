(() => {
  let m = 30;
  $$("[data-m]").forEach((b) => (b.onclick = () => { m = +b.dataset.m; $$("[data-m]").forEach((x) => x.setAttribute("aria-pressed", x === b)); $$("[data-somme]").forEach((s) => (s.textContent = euros(m))); }));
  $$("[data-payer]").forEach((b) => (b.onclick = () => {
    const ok = $("[data-paye]"); ok.hidden = false;
    ok.textContent = T(`🎭 Ici, le visiteur partirait sur la page de paiement ${b.dataset.payer} pour régler ${euros(m)}, puis reviendrait sur votre site avec « Merci, paiement reçu ! ». Vous recevez l'argent et un e-mail.`, `🎭 Here the visitor would go to the ${b.dataset.payer} payment page to pay ${euros(m)}, then come back to your site to “Thanks, payment received!”. You get the money and an email.`);
  }));
})();
