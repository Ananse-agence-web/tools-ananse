(() => {
  const lang = document.documentElement.lang, ul = $("[data-evts]");
  const jour = (n, h) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0); return d; };
  const E = [[-9, 14, 3, T("Tournoi de pétanque", "Pétanque tournament"), T("Terrain municipal", "Town pitch")], [5, 18, 2, T("Assemblée générale", "Annual general meeting"), T("Salle des fêtes", "Village hall")], [12, 20, 3, T("Concert des élèves", "Students' concert"), T("Église Saint-Pierre", "St Peter's church")], [26, 9, 8, T("Vide-grenier", "Car boot sale"), T("Place du village", "Village square")], [40, 19, 4, T("Soirée crêpes", "Pancake night"), T("Foyer rural", "Community centre")]];
  for (const [n, h, duree, titre, lieu] of E) {
    const debut = jour(n, h), fin = new Date(debut); fin.setHours(h + duree);
    const li = document.createElement("li"); li.className = "d-carte" + (n < 0 ? " passe" : "");
    li.innerHTML = `<div class="date"></div><div><strong></strong><div class="d-doux"></div></div>`;
    $(".date", li).innerHTML = `${debut.getDate()}<small></small>`; $(".date small", li).textContent = debut.toLocaleDateString(lang, { month: "short" });
    $("strong", li).textContent = titre; $(".d-doux", li).textContent = `${debut.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })} · 📍 ${lieu}${n < 0 ? T(" · terminé", " · over") : ""}`;
    if (n >= 0) { const d = document.createElement("details"); d.innerHTML = `<summary></summary>`; $("summary", d).textContent = "📅 " + T("Ajouter à mon agenda", "Add to my calendar"); d.append(Agenda.boutons({ titre, debut, fin, lieu })); $("div:last-child", li).append(d); }
    ul.append(li);
  }
})();
