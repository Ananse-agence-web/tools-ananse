(() => {
  const lots = [T("−5 %", "5% off"), T("Café offert", "Free coffee"), T("−10 %", "10% off"), T("Dessert offert", "Free dessert"), T("−15 %", "15% off"), T("Cookie offert", "Free cookie")];
  const roue = $("[data-roue]");
  lots.forEach((l, i) => { const s = document.createElement("span"); s.textContent = l; s.style.transform = `rotate(${i * 60 + 30 - 90}deg) translate(38px,-6px)`; roue.append(s); });
  let angle = 0;
  $("[data-tourner]").onclick = (e) => {
    e.target.disabled = true;
    const n = Math.floor(Math.random() * 6);
    angle += 360 * 5 + (360 - (n * 60 + 30)) - (angle % 360);
    roue.style.transform = `rotate(${angle}deg)`;
    setTimeout(() => { const g = $("[data-gain-roue]"); g.hidden = false; g.textContent = T(`🎉 Gagné : ${lots[n]} ! Montrez cet écran en caisse.`, `🎉 You won: ${lots[n]}! Show this screen at the till.`); e.target.disabled = false; }, 4100);
  };
  const c = $("[data-ticket]"), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 300, 150); g.addColorStop(0, "#b8b8b8"); g.addColorStop(1, "#8f8f8f");
  x.fillStyle = g; x.fillRect(0, 0, 300, 150);
  x.fillStyle = "#fff"; x.font = "bold 20px system-ui"; x.textAlign = "center"; x.fillText(T("GRATTEZ ICI", "SCRATCH HERE"), 150, 82);
  x.globalCompositeOperation = "destination-out";
  let appui = false;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * 300 / r.width, (e.clientY - r.top) * 150 / r.height]; };
  const gratter = (e) => { if (!appui) return; const [px, py] = pos(e); x.beginPath(); x.arc(px, py, 18, 0, 7); x.fill(); };
  c.addEventListener("pointerdown", (e) => { appui = true; c.setPointerCapture(e.pointerId); gratter(e); });
  c.addEventListener("pointermove", gratter);
  c.addEventListener("pointerup", () => (appui = false));
})();
