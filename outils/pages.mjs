// Crée les pages Hugo à partir de data/fonctions.json et data/metiers.json.
// À relancer après chaque ajout de fonction : node outils/pages.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";

const lire = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const fonctions = lire("fonctions.json").fonctions;
const metiers = lire("metiers.json").metiers;
const tous = metiers.map((m) => m.id);
const langues = ["fr", "en"];
const q = (s) => JSON.stringify(s);

// Titres et accroches déjà modifiés dans le CMS (/admin/) : on les garde.
const garde = {};
for (const f of fonctions) for (const l of langues) {
  const p = `content/demos/${f.id}.${l}.md`;
  if (!existsSync(p)) continue;
  const t = readFileSync(p, "utf8");
  const v = (k) => { const m = t.match(new RegExp(`^${k}: (.*)$`, "m")); return m ? JSON.parse(m[1]) : undefined; };
  garde[`${f.id}.${l}`] = { titre: v("title"), accroche: v("description") };
}

rmSync("content/demos", { recursive: true, force: true });
rmSync("content/metiers", { recursive: true, force: true });
mkdirSync("content/demos", { recursive: true });

fonctions.forEach((f, i) => {
  const liste = f.metiers.includes("tous") ? tous : f.metiers;
  for (const l of langues) {
    writeFileSync(`content/demos/${f.id}.${l}.md`,
      `---\ntitle: ${q(f[l].titre)}\ndescription: ${q(f[l].accroche)}\nslug: ${q(f.id)}\nfonction: ${q(f.id)}\ncat: ${q(f.cat)}\ncookies: ${f.cookies}\nweight: ${i + 1}\nmetiers: ${q(liste)}\n---\n`);
  }
});

for (const l of langues) {
  writeFileSync(`content/demos/_index.${l}.md`, `---\ntitle: ${q(l === "fr" ? "Toutes les démos" : "All demos")}\n---\n`);
  mkdirSync("content/metiers", { recursive: true });
  writeFileSync(`content/metiers/_index.${l}.md`, `---\ntitle: ${q(l === "fr" ? "Par métier" : "By trade")}\n---\n`);
  for (const m of metiers) {
    mkdirSync(`content/metiers/${m.id}`, { recursive: true });
    writeFileSync(`content/metiers/${m.id}/_index.${l}.md`, `---\ntitle: ${q(m[l])}\n---\n`);
  }
  writeFileSync(`content/devis.${l}.md`,
    `---\ntitle: ${q(l === "fr" ? "Mon devis" : "My quote")}\nlayout: devis\nslug: ${q(l === "fr" ? "devis" : "quote")}\n---\n`);
}
console.log(`${fonctions.length} fonctions × ${langues.length} langues`);
