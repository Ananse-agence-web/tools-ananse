(() => {
  const maj = () => { $("[data-apercu-titre]").textContent = $("[data-cms=titre]").value; $("[data-apercu-texte]").textContent = $("[data-cms=texte]").value; $("[data-apercu-photo]").textContent = $("[data-cms=photo]").value; };
  $$("[data-cms]").forEach((e) => e.addEventListener("input", maj)); maj();
})();
