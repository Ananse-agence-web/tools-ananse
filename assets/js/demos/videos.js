(() => {
  const z = $("[data-video]");
  $("button", z).onclick = () => {
    const f = document.createElement("iframe");
    Object.assign(f, { src: `https://www.youtube-nocookie.com/embed/${z.dataset.video}?autoplay=1`, title: "YouTube", allow: "autoplay; encrypted-media; picture-in-picture; fullscreen", allowFullscreen: true });
    f.style.cssText = "width:100%;aspect-ratio:16/9;border:0;border-radius:12px";
    z.replaceChildren(f);
  };
})();
