(() => {
  const x = Object.fromEntries($$("[data-x]").map((e) => [e.dataset.x, e]));
  const maj = () => {
    const n = +x.pieces.value; let p = n * 420 * +x.hauteur.value;
    if (x.plafonds.checked) p *= 1.3; if (x.enduit.checked) p += n * 120; if (x.urgent.checked) p *= 1.1;
    $("[data-v-pieces]").textContent = n;
    $("[data-prix-est]").textContent = `${euros(Math.round(p * .9 / 10) * 10)} – ${euros(Math.round(p * 1.1 / 10) * 10)}`;
  };
  Object.values(x).forEach((e) => e.addEventListener("input", maj)); maj();
})();
