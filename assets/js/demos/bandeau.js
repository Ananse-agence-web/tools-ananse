(() => {
  $$("[data-bandeau]").forEach((b) => (b.onclick = () => {
    $(".bandeau-demo")?.remove();
    const d = document.createElement("div"); d.className = "bandeau-demo bandeau-demo--" + b.dataset.bandeau; d.setAttribute("role", "status");
    d.append(b.dataset.texte);
    const x = Object.assign(document.createElement("button"), { type: "button", textContent: "✕" }); x.setAttribute("aria-label", T("Fermer", "Close")); x.onclick = () => d.remove();
    d.append(x); $(".entete").after(d); scrollTo({ top: 0, behavior: "smooth" });
  }));
})();
