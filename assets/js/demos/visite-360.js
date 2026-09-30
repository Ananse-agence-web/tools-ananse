(() => {
  const z = $("[data-v360]"), zone = $("[data-zone]", z);
  let source = "photo", pannellumPret = null, vue = null;
  const charger = () => pannellumPret || (pannellumPret = new Promise((ok, ko) => {
    const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: z.dataset.css });
    const s = Object.assign(document.createElement("script"), { src: z.dataset.js, onload: ok, onerror: ko });
    document.head.append(l, s);
  }));
  async function afficher() {
    if (vue && vue.destroy) { vue.destroy(); vue = null; }
    zone.replaceChildren();
    $("[data-legende-photo]", z).hidden = source !== "photo";
    $("[data-legende-google]", z).hidden = source !== "google";
    if (source === "google") {
      const f = document.createElement("iframe");
      f.title = "Google Street View"; f.allowFullscreen = true; f.loading = "lazy";
      f.src = "https://www.google.com/maps?layer=c&cbll=48.87345,2.33215&cbp=12,0,0,0,-30&output=svembed";
      zone.append(f); return;
    }
    const d = document.createElement("div"); zone.append(d);
    await charger();
    vue = pannellum.viewer(d, { type: "equirectangular", panorama: z.dataset.pano, autoLoad: true, autoRotate: -3, hfov: 100, showFullscreenCtrl: true, compass: false, strings: { loadingLabel: T("Chargement…", "Loading…") } });
  }
  $("[data-lancer]", z).onclick = afficher;
  $$("[data-source]", z).forEach((b) => (b.onclick = () => { source = b.dataset.source; $$("[data-source]", z).forEach((x) => x.setAttribute("aria-pressed", x === b)); afficher(); }));
})();
