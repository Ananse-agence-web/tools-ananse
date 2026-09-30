(() => {
  const panier = {};
  const maj = () => {
    const ul = $("[data-lignes]"); ul.replaceChildren(); let t = 0;
    for (const [nom, l] of Object.entries(panier)) {
      t += l.q * l.p;
      const li = document.createElement("li"); li.textContent = `${l.q} × ${nom} — ${euros(l.q * l.p)} `;
      const moins = Object.assign(document.createElement("button"), { type: "button", className: "lien-bouton", textContent: "−1" });
      moins.onclick = () => { if (--l.q <= 0) delete panier[nom]; maj(); };
      li.append(moins); ul.append(li);
    }
    $("[data-total]").textContent = euros(t);
    $("[data-commander]").disabled = !t;
  };
  $$("[data-ajout]").forEach((b) => (b.onclick = () => { const n = b.dataset.nom; panier[n] = panier[n] || { q: 0, p: +b.dataset.prix }; panier[n].q++; maj(); }));
  $("[data-commander]").onclick = () => { const ok = $("[data-ok]"); ok.hidden = false; ok.textContent = T("🎭 Ici, paiement sécurisé (Stripe, Snipcart ou Shopify), puis vous recevez la commande par e-mail.", "🎭 Here: secure checkout (Stripe, Snipcart or Shopify), then you get the order by email."); };
})();
