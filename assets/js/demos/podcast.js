(() => {
  const notes = [0, 4, 7, 12, 7, 4, 0, 5, 9, 12, 9, 5, 2, 7, 11, 14, 11, 7, 0, 4, 7, 12, 16, 12, 7, 4, 0, -5, 0, 4, 7, 0];
  const D = 16, pas = D / notes.length;
  let ctx = null, debut = 0, pos = 0, lecture = false, raf;
  const btn = $("[data-play]"), fmt = (s) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  function jouer() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume(); debut = ctx.currentTime - pos; lecture = true; btn.textContent = "⏸";
    notes.forEach((n, i) => {
      const t = debut + i * pas; if (t < ctx.currentTime - .01) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (n - 9) / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + pas * .95);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + pas);
    });
    boucle();
  }
  function boucle() {
    pos = ctx.currentTime - debut;
    if (pos >= D) { pos = 0; lecture = false; btn.textContent = "▶"; }
    $("[data-progres]").style.width = (pos / D * 100) + "%"; $("[data-temps]").textContent = `${fmt(pos)} / ${fmt(D)}`;
    if (lecture) raf = requestAnimationFrame(boucle);
  }
  btn.onclick = () => { if (lecture) { lecture = false; ctx.suspend(); cancelAnimationFrame(raf); btn.textContent = "▶"; ctx.close(); ctx = null; } else jouer(); };
})();
