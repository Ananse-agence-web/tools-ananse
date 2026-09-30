// Agenda : liens « Ajouter à mon agenda » (Google, Outlook) et fichier .ics (iPhone, Android, Outlook).
window.Agenda = (() => {
  const p = (n) => String(n).padStart(2, "0");
  const local = (d) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const iso = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
  const google = (e) => "https://calendar.google.com/calendar/render?" + new URLSearchParams({ action: "TEMPLATE", text: e.titre, dates: `${local(e.debut)}/${local(e.fin)}`, details: e.description || "", location: e.lieu || "" });
  const outlook = (e) => "https://outlook.live.com/calendar/0/deeplink/compose?" + new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: e.titre, startdt: iso(e.debut), enddt: iso(e.fin), body: e.description || "", location: e.lieu || "" });
  const echap = (s) => String(s || "").replace(/[\;,]/g, "\$&").replace(/\n/g, "\n");
  function ics(e) {
    const maintenant = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const texte = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ananse//Demo static//FR", "BEGIN:VEVENT",
      `UID:${Date.now()}@ananse`, `DTSTAMP:${maintenant}`, `DTSTART:${local(e.debut)}`, `DTEND:${local(e.fin)}`,
      `SUMMARY:${echap(e.titre)}`, `DESCRIPTION:${echap(e.description)}`, `LOCATION:${echap(e.lieu)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([texte], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "evenement.ics" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function boutons(e) {
    const div = document.createElement("div");
    div.className = "d-rangee";
    const lien = (texte, href) => Object.assign(document.createElement("a"), { className: "bouton bouton--clair bouton--petit", textContent: texte, href, target: "_blank", rel: "noopener" });
    const b = Object.assign(document.createElement("button"), { type: "button", className: "bouton bouton--clair bouton--petit", textContent: "📱 iPhone / Android (.ics)" });
    b.addEventListener("click", () => ics(e));
    div.append(lien("📅 Google Agenda", google(e)), lien("📧 Outlook", outlook(e)), b);
    return div;
  }
  return { google, outlook, ics, boutons };
})();
