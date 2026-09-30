(() => {
  const M = [[T("🍰 Buvette — samedi 14 h", "🍰 Refreshments — Saturday 2 pm"), 4, ["Luc", "Anne"]], [T("🎪 Montage — samedi 9 h", "🎪 Set-up — Saturday 9 am"), 6, ["Paul", "Inès", "Marc", "Zoé", "Tom"]], [T("🎫 Accueil — dimanche 10 h", "🎫 Welcome desk — Sunday 10 am"), 3, []], [T("🧹 Rangement — dimanche 18 h", "🧹 Tidy-up — Sunday 6 pm"), 5, ["Eva"]]];
  const t = $("[data-missions]");
  function dessiner() {
    t.replaceChildren();
    M.forEach((m) => {
      const [nom, places, inscrits] = m, tr = t.insertRow(), reste = places - inscrits.length;
      const c1 = tr.insertCell(); c1.innerHTML = `<strong></strong><div class="noms"></div>`; $("strong", c1).textContent = nom; $(".noms", c1).textContent = inscrits.join(", ") || "—";
      tr.insertCell().textContent = reste > 0 ? T(`${reste} place(s)`, `${reste} spot(s)`) : T("Complet ✅", "Full ✅");
      const b = Object.assign(document.createElement("button"), { type: "button", className: "bouton bouton--petit", textContent: T("Je m'inscris", "Sign me up") });
      b.disabled = reste <= 0; b.onclick = () => { const n = $("[data-benevole]").value.trim() || "?"; inscrits.push(n); dessiner(); toast(T(`Merci ${n} ! 🙌`, `Thanks ${n}! 🙌`)); };
      tr.insertCell().append(b);
    });
  }
  dessiner();
})();
