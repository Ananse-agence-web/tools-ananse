(() => {
  const vignettes = $$("[data-galerie] button"), dlg = $("[data-lightbox]"), grande = $("[data-grande]"), leg = $("[data-legende-grande]");
  let i = 0, x0 = null;
  const montrer = (n) => {
    i = (n + vignettes.length) % vignettes.length;
    const v = vignettes[i];
    grande.className = "lightbox__image " + v.className.replace(/\s*d-image/, " d-image");
    grande.textContent = v.textContent; leg.textContent = `${v.dataset.legende} · ${i + 1}/${vignettes.length}`;
  };
  vignettes.forEach((v, n) => (v.onclick = () => { montrer(n); dlg.showModal(); }));
  $("[data-prec]").onclick = () => montrer(i - 1);
  $("[data-suiv]").onclick = () => montrer(i + 1);
  $("[data-fermer]").onclick = () => dlg.close();
  dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") montrer(i - 1); if (e.key === "ArrowRight") montrer(i + 1); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  dlg.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) montrer(i + (dx < 0 ? 1 : -1)); x0 = null; });
})();
