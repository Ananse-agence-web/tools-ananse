(() => {
  const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); d.setHours(19, 0, 0, 0);
  const fin = new Date(d); fin.setHours(22);
  $("[data-date]").textContent = d.toLocaleDateString(document.documentElement.lang, { weekday: "long", day: "numeric", month: "long" });
  $("[data-boutons]").append(Agenda.boutons({ titre: T("Soirée dégustation", "Wine-tasting evening"), debut: d, fin, lieu: T("8 place du Marché", "8 Market Square"), description: T("Démo « Ce qu'on peut faire avec le web statique »", "Demo from “What you can do with a static site”") }));
})();
