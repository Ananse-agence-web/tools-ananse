(() => {
  const O = [[T("Samedi 14 juin", "Saturday 14 June"), 18], [T("Samedi 21 juin", "Saturday 21 June"), 25], [T("Samedi 28 juin", "Saturday 28 June"), 11]];
  let vote = stock.lire("sondage-demo", null);
  const z = $("[data-options]");
  function dessiner() {
    z.replaceChildren();
    if (vote === null) {
      O.forEach(([n], i) => { const l = document.createElement("label"); l.className = "d-case"; l.innerHTML = `<input type="radio" name="s" value="${i}"> `; l.append(n); z.append(l); });
      $("[data-voter]").hidden = false; return;
    }
    $("[data-voter]").hidden = true;
    const tot = O.reduce((s, [, v]) => s + v, 0) + 1;
    O.forEach(([n, v], i) => {
      const x = v + (i === vote ? 1 : 0), d = document.createElement("div");
      d.innerHTML = `<div class="d-rangee" style="justify-content:space-between"><span></span><strong></strong></div><div class="d-barre"><span></span></div>`;
      $("span", d).textContent = n + (i === vote ? T(" · votre vote", " · your vote") : ""); $("strong", d).textContent = Math.round(x / tot * 100) + " %";
      z.append(d); requestAnimationFrame(() => ($(".d-barre span", d).style.width = (x / tot * 100) + "%"));
    });
    const r = Object.assign(document.createElement("button"), { type: "button", className: "lien-bouton", textContent: T("Changer mon vote", "Change my vote") });
    r.onclick = () => { vote = null; stock.ecrire("sondage-demo", "null"); dessiner(); }; z.append(r);
  }
  $("[data-voter]").onclick = () => { const c = $("input[name=s]:checked"); if (!c) return toast(T("Choisissez une date", "Pick a date")); vote = +c.value; stock.ecrire("sondage-demo", String(vote)); dessiner(); };
  dessiner();
})();
