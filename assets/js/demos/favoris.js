(() => {
  let fav = stock.lire("favoris", []), seuls = false;
  const biens = $$("[data-biens] li");
  const maj = () => {
    biens.forEach((b) => { const on = fav.includes(b.dataset.id); const c = $("[data-coeur]", b); c.setAttribute("aria-pressed", on); c.textContent = on ? "♥" : "♡"; b.classList.toggle("d-cache", seuls && !on); });
    $("[data-nb-favoris]").textContent = fav.length;
  };
  biens.forEach((b) => ($("[data-coeur]", b).onclick = () => { const id = b.dataset.id; fav = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]; stock.ecrire("favoris", fav); maj(); }));
  $("[data-voir-favoris]").onclick = (e) => { seuls = !seuls; e.currentTarget.setAttribute("aria-pressed", seuls); maj(); };
  maj();
})();
