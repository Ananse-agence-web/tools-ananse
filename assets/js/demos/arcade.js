(() => {
  const c = $("[data-jeu]"), x = c.getContext("2d"), W = 480, H = 360;
  let joueur = W / 2, objets = [], score = 0, temps = 30, enCours = false, dernier = 0, horloge, gauche = false, droite = false;
  let record = +(stock.lire("arcade-record", 0)) || 0; $("[data-record]").textContent = record;
  const bons = ["🥐", "🍩", "🍓", "🧁", "🍪"];
  function araignee(px) {
    x.strokeStyle = "#231F1C"; x.lineWidth = 5; x.lineCap = "round";
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(px + s * 14, H - 34 + k * 8); x.quadraticCurveTo(px + s * 32, H - 50 + k * 10, px + s * 38, H - 26 + k * 8); x.stroke(); }
    x.fillStyle = "#231F1C"; x.beginPath(); x.arc(px, H - 30, 22, 0, 7); x.fill();
    x.fillStyle = "#fff"; for (const s of [-1, 1]) { x.beginPath(); x.arc(px + s * 8, H - 36, 6, 0, 7); x.fill(); }
    x.fillStyle = "#231F1C"; for (const s of [-1, 1]) { x.beginPath(); x.arc(px + s * 8 + 1, H - 35, 3, 0, 7); x.fill(); }
    x.fillStyle = "#F2B33D"; x.fillRect(px - 16, H - 52, 32, 6);
  }
  function image(t) {
    const dt = Math.min(50, t - dernier); dernier = t;
    if (gauche) joueur -= dt * .45; if (droite) joueur += dt * .45;
    joueur = Math.max(30, Math.min(W - 30, joueur));
    if (Math.random() < dt / 520) objets.push({ x: 20 + Math.random() * (W - 40), y: -20, v: .12 + Math.random() * .12 + (30 - temps) * .004, e: Math.random() < .22 ? "🌶️" : bons[Math.floor(Math.random() * bons.length)] });
    x.clearRect(0, 0, W, H);
    x.font = "30px system-ui"; x.textAlign = "center";
    objets = objets.filter((o) => {
      o.y += o.v * dt;
      if (o.y > H - 60 && o.y < H - 20 && Math.abs(o.x - joueur) < 38) { score += o.e === "🌶️" ? -3 : 1; $("[data-score]").textContent = score; return false; }
      x.fillText(o.e, o.x, o.y); return o.y < H + 20;
    });
    araignee(joueur);
    if (enCours) requestAnimationFrame(image);
  }
  function fin() {
    enCours = false; clearInterval(horloge);
    if (score > record) { record = score; stock.ecrire("arcade-record", String(record)); $("[data-record]").textContent = record; }
    x.fillStyle = "rgb(0 0 0 / .55)"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#fff"; x.font = "bold 30px system-ui"; x.fillText(T(`Score : ${score}`, `Score: ${score}`), W / 2, H / 2);
    $("[data-jouer]").disabled = false;
  }
  $("[data-jouer]").onclick = (e) => {
    e.target.disabled = true; objets = []; score = 0; temps = 30; enCours = true;
    $("[data-score]").textContent = 0; $("[data-temps]").textContent = 30;
    horloge = setInterval(() => { $("[data-temps]").textContent = --temps; if (temps <= 0) fin(); }, 1000);
    dernier = performance.now(); requestAnimationFrame(image);
  };
  const suivre = (e) => { const r = c.getBoundingClientRect(); joueur = (e.clientX - r.left) * W / r.width; };
  c.addEventListener("pointermove", suivre); c.addEventListener("pointerdown", suivre);
  addEventListener("keydown", (e) => { if (!enCours) return; if (e.key === "ArrowLeft") { gauche = true; e.preventDefault(); } if (e.key === "ArrowRight") { droite = true; e.preventDefault(); } });
  addEventListener("keyup", (e) => { if (e.key === "ArrowLeft") gauche = false; if (e.key === "ArrowRight") droite = false; });
  x.fillStyle = "#231F1C"; x.font = "bold 22px system-ui"; x.textAlign = "center"; x.fillText(T("Cliquez sur Jouer !", "Click Play!"), W / 2, H / 2); araignee(W / 2);
})();
