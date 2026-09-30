(() => { const d = $("[data-date-min]"); d.min = new Date().toISOString().slice(0, 10); d.value = d.min; })();
