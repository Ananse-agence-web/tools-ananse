(() => {
  const f = Object.fromEntries($$("[data-f]").map((e) => [e.dataset.f, e])), biens = $$("[data-biens] li");
  $$("[data-coeur]").forEach((c) => c.remove());
  const maj = () => {
    $("[data-v=prix]").textContent = euros(+f.prix.value); $("[data-v=surface]").textContent = f.surface.value + " m²";
    let n = 0;
    biens.forEach((b) => {
      const ok = (!f.type.value || b.dataset.type === f.type.value) && (!f.ville.value || b.dataset.ville === f.ville.value) && +b.dataset.prix <= +f.prix.value && +b.dataset.surface >= +f.surface.value;
      b.classList.toggle("d-cache", !ok); if (ok) n++;
    });
    $("[data-nb-biens]").textContent = T(`${n} bien(s) trouvé(s)`, `${n} propert${n > 1 ? "ies" : "y"} found`);
  };
  Object.values(f).forEach((e) => e.addEventListener("input", maj)); maj();
})();
