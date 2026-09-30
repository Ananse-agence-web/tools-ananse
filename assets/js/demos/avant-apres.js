(() => { const aa = $("[data-aa]"); $("input", aa).addEventListener("input", (e) => aa.style.setProperty("--pos", e.target.value + "%")); })();
