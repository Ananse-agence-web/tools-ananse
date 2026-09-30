(() => {
  const r = Object.fromEntries($$("[data-r]").map((x) => [x.dataset.r, x]));
  const pct = (x) => nombre(x * 100, 2) + " %";
  const maj = () => {
    const cout = +r.prix.value + +r.frais.value, an = +r.loyer.value * 12;
    $("[data-brut]").textContent = pct(an / cout); $("[data-net]").textContent = pct((an - +r.charges.value) / cout);
    $("[data-cash]").textContent = T(`Revenu net : ${euros(an - +r.charges.value)} par an, avant impôts.`, `Net income: ${euros(an - +r.charges.value)} a year, before tax.`);
  };
  Object.values(r).forEach((x) => x.addEventListener("input", maj)); maj();
})();
