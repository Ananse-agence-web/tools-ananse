(() => {
  const lignes = $$("[data-carte-plats] li");
  const maj = () => {
    let t = 0; const cmd = [];
    lignes.forEach((l) => { const q = +$("[data-q]", l).textContent; if (q) { t += q * l.dataset.prix; cmd.push(`• ${q} × ${l.dataset.nom}`); } });
    const texte = [T("Bonjour, je voudrais commander :", "Hello, I'd like to order:"), ...cmd, T(`Total : ${euros(t)}`, `Total: ${euros(t)}`), T(`Retrait à ${$("[data-retrait]").value} — ${$("[data-prenom]").value}`, `Pick-up at ${$("[data-retrait]").value} — ${$("[data-prenom]").value}`)].join("\n");
    $("[data-total]").textContent = euros(t);
    $("[data-apercu-cmd]").textContent = cmd.length ? texte : T("Ajoutez des plats…", "Add some dishes…");
    $("[data-envoyer]").href = `https://wa.me/?text=${encodeURIComponent(texte)}`;
  };
  lignes.forEach((l) => {
    const q = $("[data-q]", l);
    $("[data-plus]", l).onclick = () => { q.textContent = +q.textContent + 1; maj(); };
    $("[data-moins]", l).onclick = () => { q.textContent = Math.max(0, +q.textContent - 1); maj(); };
  });
  $("[data-prenom]").oninput = $("[data-retrait]").oninput = maj; maj();
})();
