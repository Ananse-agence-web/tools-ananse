(() => {
  const lang = document.documentElement.lang;
  const P = [["Place du Capitole", 43.6045, 1.4440, "11h30 – 14h"], ["Saint-Cyprien", 43.5985, 1.4318, "11h30 – 14h"], ["Compans-Caffarelli", 43.6107, 1.4336, "11h30 – 14h"], ["Rangueil", 43.5728, 1.4631, "11h30 – 14h"], ["Les Carmes", 43.5975, 1.4453, "18h30 – 22h"], [T("Marché de Blagnac", "Blagnac market"), 43.6377, 1.3908, "9h – 13h"]];
  const auj = (new Date().getDay() + 6) % 7, ul = $("[data-planning]");
  const carte = (lat, lon) => { const f = document.createElement("iframe"); f.title = "Carte"; f.style.cssText = "width:100%;aspect-ratio:4/3;border:0;border-radius:12px"; f.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - .006},${lat - .004},${lon + .006},${lat + .004}&layer=mapnik&marker=${lat},${lon}`; $("[data-ft-carte]").replaceChildren(f); };
  P.forEach(([lieu, lat, lon, h], i) => {
    const li = document.createElement("li"); if (i === auj) li.className = "auj";
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<strong></strong><span></span>`;
    b.querySelector("strong").textContent = new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "long" }) + (i === auj ? T(" · aujourd'hui", " · today") : "");
    b.querySelector("span").textContent = `📍 ${lieu} · ${h}`;
    b.onclick = () => carte(lat, lon);
    li.append(b); ul.append(li);
  });
  if (auj === 6) ul.append(Object.assign(document.createElement("li"), { className: "d-doux", textContent: T("Dimanche : repos 😴", "Sunday: day off 😴") }));
})();
