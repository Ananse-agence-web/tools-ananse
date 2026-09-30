(() => {
  const url = location.href, titre = document.title, u = encodeURIComponent(url), t = encodeURIComponent(titre);
  const liens = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    email: `mailto:?subject=${t}&body=${u}`,
  };
  $$("[data-reseau]").forEach((a) => (a.href = liens[a.dataset.reseau]));
  $("[data-copier-lien]").onclick = async () => { try { await navigator.clipboard.writeText(url); toast(T("Lien copié ✔", "Link copied ✔")); } catch {} };
  const n = $("[data-partage-natif]");
  if (navigator.share) { n.hidden = false; n.onclick = () => navigator.share({ title: titre, url }).catch(() => {}); }
})();
