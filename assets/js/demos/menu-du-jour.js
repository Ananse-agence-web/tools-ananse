(() => {
  const t = $("[data-tableur]"), m = $("[data-menu]");
  $("[data-date]").textContent = new Date().toLocaleDateString(document.documentElement.lang, { weekday: "long", day: "numeric", month: "long" });
  const maj = () => {
    m.replaceChildren();
    for (const tr of $$("tbody tr", t)) {
      const [a, b] = $$("input", tr); if (!a.value.trim()) continue;
      const li = document.createElement("li");
      li.append(Object.assign(document.createElement("span"), { textContent: a.value }), Object.assign(document.createElement("strong"), { textContent: b.value ? b.value + " €" : "" }));
      m.append(li);
    }
  };
  t.addEventListener("input", maj); maj();
})();
