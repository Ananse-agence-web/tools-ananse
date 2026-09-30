(() => {
  const Q = [
    [T("Quelle farine pour une baguette de tradition ?", "Which flour is used for a traditional French baguette?"), ["T65", "T150", T("Farine de riz", "Rice flour")], 0],
    [T("Quel fromage met-on dans une tartiflette ?", "Which cheese goes into a tartiflette?"), ["Comté", "Reblochon", "Brie"], 1],
    [T("Le macaron parisien est fait avec de la poudre de…", "A Parisian macaron is made with ground…"), [T("noisette", "hazelnuts"), T("coco", "coconut"), T("amande", "almonds")], 2],
    [T("Le croissant serait inspiré d'une viennoiserie venue de…", "The croissant is said to come from a pastry from…"), [T("Vienne (Autriche)", "Vienna (Austria)"), T("Rome", "Rome"), T("Bruxelles", "Brussels")], 0],
  ];
  const z = $("[data-quiz]"); let i = 0, score = 0;
  function afficher() {
    const [q, reps, bon] = Q[i];
    $("[data-progres]", z).textContent = T(`Question ${i + 1} sur ${Q.length}`, `Question ${i + 1} of ${Q.length}`);
    $("[data-question]", z).textContent = q;
    const r = $("[data-reponses]", z); r.replaceChildren();
    reps.forEach((texte, k) => {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: texte });
      b.onclick = () => {
        $$("button", r).forEach((x, n) => { x.disabled = true; if (n === bon) x.classList.add("bon"); });
        if (k === bon) score++; else b.classList.add("faux");
        setTimeout(() => (++i < Q.length ? afficher() : fin()), 900);
      };
      r.append(b);
    });
  }
  function fin() {
    $("[data-question]", z).textContent = T(`Score : ${score} / ${Q.length} ${score === Q.length ? "🏆" : "👏"}`, `Score: ${score} / ${Q.length} ${score === Q.length ? "🏆" : "👏"}`);
    $("[data-reponses]", z).replaceChildren(); $("[data-progres]", z).textContent = "";
    const b = $("[data-bilan]", z); b.hidden = false;
    b.innerHTML = ""; b.append(T("Bravo ! Votre code : ", "Well done! Your code: "), Object.assign(document.createElement("strong"), { textContent: "QUIZ10" }), " ");
    const rej = Object.assign(document.createElement("button"), { type: "button", className: "bouton bouton--petit bouton--clair", textContent: T("Rejouer", "Play again") });
    rej.onclick = () => { i = 0; score = 0; b.hidden = true; afficher(); };
    b.append(rej);
  }
  afficher();
})();
