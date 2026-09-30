(() => {
  const z = $("[data-carte]"), lat = +z.dataset.lat, lon = +z.dataset.lon;
  let f = "osm";
  const url = () => f === "osm"
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lon - .006},${lat - .003},${lon + .006},${lat + .003}&layer=mapnik&marker=${lat},${lon}`
    : `https://www.google.com/maps?q=${lat},${lon}&z=16&output=embed`;
  const iti = () => ($("[data-itineraire]").href = f === "osm" ? `https://www.openstreetmap.org/directions?to=${lat},${lon}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
  const charger = () => {
    let fr = $("iframe", z);
    if (!fr) { fr = document.createElement("iframe"); fr.style.cssText = "width:100%;max-width:760px;aspect-ratio:16/9;border:0;border-radius:12px;display:block"; fr.loading = "lazy"; fr.title = "Carte"; $("[data-charger]").replaceWith(fr); }
    fr.src = url();
  };
  $("[data-charger]").onclick = charger;
  $$("[data-fournisseur]").forEach((b) => (b.onclick = () => { f = b.dataset.fournisseur; $$("[data-fournisseur]").forEach((x) => x.setAttribute("aria-pressed", x === b)); iti(); if ($("iframe", z)) charger(); }));
  iti();
})();
