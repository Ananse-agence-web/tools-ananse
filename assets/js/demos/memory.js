(() => {
  const z = $("[data-memory]");
  let a = null, b = null, coups = 0, paires = 0, bloque = false;
  function partie() {
    z.replaceChildren(); a = b = null; coups = paires = 0; bloque = false; $("[data-gagne]").hidden = true; maj();
    const cartes = ["🍕", "🥐", "🍩", "🍓", "🧀", "🥑"].flatMap((e) => [e, e]).sort(() => Math.random() - .5);
    for (const e of cartes) {
      const c = document.createElement("button"); c.type = "button"; c.innerHTML = `<span>${e}</span>`; c.dataset.e = e; c.setAttribute("aria-label", T("Carte", "Card"));
      c.onclick = () => retourner(c); z.append(c);
    }
  }
  function maj() { $("[data-coups]").textContent = coups; $("[data-paires]").textContent = paires; }
  function retourner(c) {
    if (bloque || c === a || c.classList.contains("ok")) return;
    c.classList.add("vu");
    if (!a) { a = c; return; }
    b = c; coups++;
    if (a.dataset.e === b.dataset.e) { a.classList.add("ok"); b.classList.add("ok"); a = b = null; paires++; maj(); if (paires === 6) { const g = $("[data-gagne]"); g.hidden = false; g.textContent = T(`🎉 Gagné en ${coups} coups !`, `🎉 You won in ${coups} moves!`); } return; }
    bloque = true; maj();
    setTimeout(() => { a.classList.remove("vu"); b.classList.remove("vu"); a = b = null; bloque = false; }, 800);
  }
  $("[data-rejouer]").onclick = partie;
  partie();
})();
