(() => {
  const cases = $$("[data-filtres] input"), plats = $$("[data-plats] li");
  const maj = () => {
    const evites = cases.filter((c) => c.checked).map((c) => c.value);
    let n = 0;
    plats.forEach((p) => { const a = p.dataset.allergenes.split(" "); const cache = evites.some((e) => a.includes(e)); p.classList.toggle("d-cache", cache); if (!cache) n++; });
    cases.forEach((c) => c.parentElement.setAttribute("aria-pressed", c.checked));
    $("[data-compte]").textContent = T(`${n} plat(s) pour vous sur ${plats.length}`, `${n} dish(es) for you out of ${plats.length}`);
  };
  cases.forEach((c) => (c.onchange = maj)); maj();
})();
