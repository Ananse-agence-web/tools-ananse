(() => {
  const c = $("[data-chat]"), fil = $("[data-fil]");
  $("[data-chat-ouvrir]").onclick = () => { c.hidden = !c.hidden; if (!c.hidden) $("input", c).focus(); };
  $("[data-chat-fermer]").onclick = () => (c.hidden = true);
  const msg = (t, moi) => { const p = Object.assign(document.createElement("p"), { className: "chat__msg" + (moi ? " chat__msg--moi" : ""), textContent: t }); fil.append(p); fil.scrollTop = fil.scrollHeight; };
  $("[data-chat-form]").addEventListener("submit", (e) => {
    e.preventDefault(); const i = $("input", c); if (!i.value.trim()) return;
    msg(i.value, true); i.value = "";
    setTimeout(() => msg(T("Merci ! (Démo) Sur votre site, vous recevriez ce message sur votre téléphone et répondriez d'ici.", "Thanks! (Demo) On your site, you'd get this message on your phone and reply from there."), false), 900);
  });
})();
