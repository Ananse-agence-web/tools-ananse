(() => {
  const t = {
    fr: ["Bienvenue au Gîte des Oliviers", "Une maison de pierre au calme, piscine et vue sur les vignes. À 10 minutes de la mer."],
    en: ["Welcome to the Olive Tree Cottage", "A quiet stone house with a pool and vineyard views. 10 minutes from the sea."],
    es: ["Bienvenidos al Gîte des Oliviers", "Una casa de piedra tranquila, con piscina y vistas a los viñedos. A 10 minutos del mar."],
    de: ["Willkommen im Gîte des Oliviers", "Ein ruhiges Steinhaus mit Pool und Blick auf die Weinberge. 10 Minuten vom Meer."],
    it: ["Benvenuti al Gîte des Oliviers", "Una casa in pietra tranquilla, con piscina e vista sui vigneti. A 10 minuti dal mare."],
  };
  const z = $("[data-langues]");
  $$("[data-l]", z).forEach((b) => (b.onclick = () => {
    $$("[data-l]", z).forEach((x) => x.setAttribute("aria-pressed", x === b));
    [$("[data-t=titre]", z).textContent, $("[data-t=texte]", z).textContent] = t[b.dataset.l];
    z.lang = b.dataset.l;
  }));
})();
