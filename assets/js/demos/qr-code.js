(() => {
  const champ = $("[data-qr-texte]"), z = $("[data-qr]");
  champ.value = location.origin + (document.body.dataset.racine || "/");
  const dessiner = () => {
    const q = qrcode(0, "M"); q.addData(champ.value || " "); q.make();
    z.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  };
  champ.addEventListener("input", dessiner); dessiner();
  $("[data-qr-telecharger]").onclick = () => {
    const url = URL.createObjectURL(new Blob([z.innerHTML], { type: "image/svg+xml" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "qr-code.svg" }); document.body.append(a); a.click(); a.remove();
  };
})();
