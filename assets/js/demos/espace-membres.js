(() => {
  $("[data-membres]").addEventListener("submit", (e) => {
    e.preventDefault();
    if (["membres", "members"].includes($("[data-mdp]").value.trim().toLowerCase())) { e.target.hidden = true; $("[data-prive]").hidden = false; }
    else toast(T("Mot de passe incorrect", "Wrong password"));
  });
})();
