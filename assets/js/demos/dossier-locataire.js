(() => {
  const cases = $$("[data-dl] input"); let faits = stock.lire("dossier-demo", []);
  const maj = () => { const n = cases.filter((c) => c.checked).length; $("[data-dl-progres]").textContent = `${n}/${cases.length}`; $("[data-dl-barre]").style.width = (n / cases.length * 100) + "%"; };
  cases.forEach((c) => { c.checked = faits.includes(c.value); c.onchange = () => { faits = cases.filter((x) => x.checked).map((x) => x.value); stock.ecrire("dossier-demo", faits); maj(); }; });
  maj();
})();
