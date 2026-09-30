(() => {
  const e = Object.fromEntries($$("[data-e]").map((x) => [x.dataset.e, x]));
  const maj = () => { const v = +e.surface.value * +e.secteur.value * +e.type.value * +e.etat.value; $("[data-fourchette]").textContent = `${euros(Math.round(v * .93 / 1000) * 1000)} – ${euros(Math.round(v * 1.07 / 1000) * 1000)}`; };
  Object.values(e).forEach((x) => x.addEventListener("input", maj)); maj();
})();
