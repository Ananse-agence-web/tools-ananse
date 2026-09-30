(() => {
  const c = $("[data-cible]"), d = new Date(); d.setDate(d.getDate() + 12); d.setHours(10, 0, 0, 0);
  const loc = (x) => new Date(x - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  c.value = loc(d);
  const tic = () => {
    let s = Math.max(0, Math.floor((new Date(c.value) - new Date()) / 1000));
    const v = { j: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    for (const k in v) $(`[data-u=${k}]`).textContent = v[k];
  };
  c.oninput = tic; tic(); setInterval(tic, 1000);
})();
