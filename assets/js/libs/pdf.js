// MiniPDF : fabrique un PDF A4 d'une page dans le navigateur, sans bibliothèque.
// Coordonnées en points depuis le coin haut gauche. Polices Helvetica / Helvetica-Bold.
window.MiniPDF = function () {
  const W = 595.28, H = 841.89, ops = [];
  const speciaux = { "€": 128, "‚": 130, "„": 132, "…": 133, "Œ": 140, "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149, "–": 150, "—": 151, "™": 153, "œ": 156, " ": 32, " ": 32 };
  const latin = (s) => [...String(s)].map((c) => { if (c in speciaux) return String.fromCharCode(speciaux[c]); const n = c.codePointAt(0); return n < 256 && !(n >= 128 && n < 160) ? c : ""; }).join("");
  const esc = (s) => latin(s).replace(/[\()]/g, "\$&");
  const rgb = (hex = "#000000") => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(3)).join(" "); };
  const api = {
    W, H,
    texte(x, y, s, o = {}) { ops.push(`BT /${o.gras ? "F2" : "F1"} ${o.taille || 11} Tf ${rgb(o.couleur)} rg ${x.toFixed(2)} ${(H - y).toFixed(2)} Td (${esc(s)}) Tj ET`); },
    droite(x, y, s, o = {}) { api.texte(x - api.largeur(s, o.taille || 11, o.gras), y, s, o); },
    centre(y, s, o = {}) { api.texte((W - api.largeur(s, o.taille || 11, o.gras)) / 2, y, s, o); },
    ligne(x1, y1, x2, y2, o = {}) { ops.push(`${o.epaisseur || .8} w ${rgb(o.couleur || "#999999")} RG ${x1} ${H - y1} m ${x2} ${H - y2} l S`); },
    rect(x, y, w, h, o = {}) { ops.push(o.contour ? `${o.epaisseur || 1} w ${rgb(o.contour)} RG ${x} ${H - y - h} ${w} ${h} re S` : `${rgb(o.fond || "#eeeeee")} rg ${x} ${H - y - h} ${w} ${h} re f`); },
    largeur: (s, t = 11, gras) => latin(s).length * t * (gras ? .56 : .5),
    paragraphe(x, y, s, max, o = {}) {
      const t = o.taille || 11, lh = o.interligne || t * 1.4;
      let ligne = "";
      for (const mot of String(s).split(/\s+/)) {
        const essai = ligne ? ligne + " " + mot : mot;
        if (api.largeur(essai, t, o.gras) > max && ligne) { api.texte(x, y, ligne, o); y += lh; ligne = mot; } else ligne = essai;
      }
      if (ligne) { api.texte(x, y, ligne, o); y += lh; }
      return y;
    },
    octets() {
      const flux = ops.join("\n");
      const objets = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
        `<< /Length ${flux.length} >>\nstream\n${flux}\nendstream`,
      ];
      let sortie = "%PDF-1.4\n", pos = [];
      objets.forEach((o, i) => { pos.push(sortie.length); sortie += `${i + 1} 0 obj\n${o}\nendobj\n`; });
      const xref = sortie.length;
      sortie += `xref\n0 ${objets.length + 1}\n0000000000 65535 f \n` + pos.map((p) => String(p).padStart(10, "0") + " 00000 n \n").join("");
      sortie += `trailer\n<< /Size ${objets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
      return Uint8Array.from(sortie, (c) => c.charCodeAt(0));
    },
    telecharger(nom) {
      const url = URL.createObjectURL(new Blob([api.octets()], { type: "application/pdf" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: nom });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
  };
  return api;
};
