(() => {
  const pieces = { [T("Entrée", "Hall")]: [T("Porte", "Door"), T("Sol", "Floor"), T("Murs", "Walls")], [T("Séjour", "Living room")]: [T("Sol", "Floor"), T("Murs", "Walls"), T("Fenêtres", "Windows"), T("Prises", "Sockets")], [T("Cuisine", "Kitchen")]: [T("Évier", "Sink"), T("Plaques", "Hob"), T("Placards", "Cupboards")], [T("Salle de bains", "Bathroom")]: [T("Douche", "Shower"), T("Lavabo", "Basin"), "WC"] };
  const etats = [["bon", T("Bon", "Good")], ["moyen", T("Moyen", "Fair")], ["mauvais", T("Mauvais", "Poor")]];
  let rep = stock.lire("edl-demo", {});
  const total = Object.values(pieces).flat().length, z = $("[data-edl]");
  function dessiner() {
    z.replaceChildren();
    for (const [p, elts] of Object.entries(pieces)) {
      const d = document.createElement("details"); d.className = "edl-piece d-carte"; d.open = p === Object.keys(pieces)[0];
      const fait = elts.filter((e) => rep[p + "/" + e]).length;
      d.innerHTML = `<summary></summary>`; d.querySelector("summary").textContent = `${p} · ${fait}/${elts.length}${fait === elts.length ? " ✅" : ""}`;
      for (const e of elts) {
        const l = document.createElement("div"); l.className = "edl-ligne"; l.append(Object.assign(document.createElement("span"), { textContent: e }));
        const o = document.createElement("div"); o.className = "d-onglets";
        for (const [k, n] of etats) { const b = Object.assign(document.createElement("button"), { type: "button", textContent: n }); b.setAttribute("aria-pressed", rep[p + "/" + e] === k); b.onclick = () => { rep[p + "/" + e] = k; stock.ecrire("edl-demo", rep); const ouvert = [...z.querySelectorAll("details")].map((x) => x.open); dessiner(); z.querySelectorAll("details").forEach((x, i) => (x.open = ouvert[i])); }; o.append(b); }
        l.append(o); d.append(l);
      }
      z.append(d);
    }
    const n = Object.keys(rep).length;
    $("[data-edl-progres]").textContent = `${n}/${total}`; $("[data-edl-barre]").style.width = (n / total * 100) + "%";
  }
  $("[data-edl-raz]").onclick = () => { rep = {}; stock.ecrire("edl-demo", rep); dessiner(); };
  dessiner();
})();
