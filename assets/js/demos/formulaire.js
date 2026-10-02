// Démo « formulaire » : envoi réel via Web3Forms, sans quitter la page.
(() => {
  const f = document.querySelector("[data-web3forms]");
  if (!f) return;
  const ok = f.parentElement.querySelector("[data-w3f-ok]");
  const err = f.parentElement.querySelector("[data-w3f-err]");
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bouton = f.querySelector("button[type=submit]");
    bouton.disabled = true;
    err.hidden = true;
    try {
      const r = await fetch(f.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(f),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || r.status);
      f.hidden = true;
      ok.hidden = false;
    } catch {
      err.hidden = false;
      bouton.disabled = false;
    }
  });
})();
