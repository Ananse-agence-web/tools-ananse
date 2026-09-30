// Petits comportements partagés par les démos.
(() => {
  const EN = document.documentElement.lang === "en";
  window.euros = (n, dec = 0) => new Intl.NumberFormat(EN ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: dec, minimumFractionDigits: dec }).format(n);
  window.nombre = (n, dec = 0) => new Intl.NumberFormat(EN ? "en-GB" : "fr-FR", { maximumFractionDigits: dec }).format(n);
  window.$ = (s, r = document) => r.querySelector(s);
  window.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-toast]");
    if (t) { e.preventDefault(); toast(t.dataset.toast); }
    const s = e.target.closest("[data-simule]");
    if (s) {
      const m = document.createElement("div");
      m.className = "d-clic"; m.style.cursor = "default"; m.style.aspectRatio = s.style.aspectRatio;
      m.innerHTML = `<span style="font-size:2.5rem">🎭</span><strong></strong>`;
      m.querySelector("strong").textContent = s.dataset.simule;
      s.replaceWith(m);
    }
    const c = e.target.closest("[data-copier-adresse]");
    if (c) { try { await navigator.clipboard.writeText(c.dataset.copierAdresse); toast(T("Adresse copiée ✔", "Address copied ✔")); } catch {} }
    const tel = e.target.closest("[data-demo-tel]");
    if (tel && !matchMedia("(pointer: coarse)").matches) { e.preventDefault(); toast(T("Sur téléphone, l'appel se lancerait vers votre numéro", "On a phone, this would call your number")); }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-demo-form]");
    if (!f) return;
    e.preventDefault();
    f.hidden = true;
    const ok = f.parentElement.querySelector("[data-demo-ok]");
    if (ok) ok.hidden = false;
  });
})();
