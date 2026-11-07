import { BYNAME, CATALOG, norm, type AisleKey, type GroupKey, type Product, type SourceKey } from "./data";

export type Item = Product & { id: string; qty: number; done: boolean; custom?: boolean };
export type Shop = { d: string; t: number; n: number };
export type State = {
  v: 1;
  example?: boolean;
  budget: number;
  items: Item[];
  history: Shop[];
  freq: Record<string, number>;
  my: Record<string, Product>; // prodotti e prezzi personalizzati dall'utente
};

export const uid = () => Math.random().toString(36).slice(2, 9);

function mk(name: string, qty = 1): Item {
  const c = BYNAME[norm(name)];
  return { ...c, id: uid(), qty, done: false };
}

export function exampleState(): State {
  return {
    v: 1, example: true, budget: 400, history: [], freq: {}, my: {},
    items: [
      mk("Zucchine"), mk("Mele"), mk("Banane"), mk("Insalata in busta", 2), mk("Pomodorini"), mk("Pasta", 2),
      mk("Pane integrale"), mk("Petto di pollo"), mk("Prosciutto cotto"), mk("Uova"), mk("Yogurt bianco"),
      mk("Mozzarella", 2), mk("Ceci in scatola"), mk("Passata di pomodoro"), mk("Biscotti"), mk("Acqua naturale"),
      mk("Detersivo piatti"),
    ],
  };
}

/* ---------- formati ---------- */
export const eur = (n: number) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
export const eur0 = (n: number) => Math.round(n).toLocaleString("it-IT") + " €";
export const parseNum = (s: string) => {
  const n = parseFloat(String(s).replace(",", "."));
  return isFinite(n) ? n : 0;
};
export const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const listTotal = (items: Item[]) => items.reduce((s, i) => s + i.price * i.qty, 0);
export const spentThisMonth = (st: State) => {
  const m = todayISO().slice(0, 7);
  return st.history.filter((h) => h.d.slice(0, 7) === m).reduce((s, h) => s + h.t, 0);
};

/* ---------- prodotti ---------- */
export function lookup(st: State, name: string): Product | null {
  const k = norm(name);
  const c = BYNAME[k], m = st.my?.[k];
  if (!c && !m) return null;
  return { ...(c || {}), ...(m || {}) } as Product;
}

const stem = (w: string) => (w.length > 3 ? w.replace(/[aeiou]$/, "") : w);
export function search(st: State, q: string): Product[] {
  q = norm(q);
  if (!q) return [];
  const qs = stem(q);
  const score = (c: Product) => {
    const n = norm(c.name), ws = n.split(/[\s']/);
    if (n.startsWith(q)) return 0;
    if (ws.some((w) => w.startsWith(q))) return 1;
    if (ws.some((w) => w.startsWith(qs))) return 2;
    if (n.includes(q)) return 3;
    return 9;
  };
  const pool: Record<string, Product> = {};
  for (const c of CATALOG) pool[norm(c.name)] = c;
  for (const k in st.my || {}) pool[k] = lookup(st, k)!;
  return Object.values(pool)
    .map((c) => [score(c), c] as const)
    .filter((x) => x[0] < 9)
    .sort((a, b) => a[0] - b[0] || a[1].name.length - b[1].name.length)
    .slice(0, 6)
    .map((x) => x[1]);
}

export function quickPicks(st: State): { label: string; names: string[] } {
  const inList = new Set(st.items.map((i) => norm(i.name)));
  let names = Object.entries(st.freq || {}).sort((a, b) => b[1] - a[1]).map((e) => e[0]);
  let label = "I tuoi soliti";
  if (names.length < 4) {
    label = "Veloci";
    names = names.concat(["Latte", "Pane", "Uova", "Banane", "Pomodori", "Pasta", "Yogurt bianco", "Lenticchie secche", "Insalata", "Caffè"]);
  }
  return { label, names: [...new Set(names)].filter((n) => !inList.has(norm(n))).slice(0, 8) };
}

/* ---------- equilibrio ---------- */
export type Tip = { g: GroupKey; t: string; x: string; src: SourceKey[]; add?: string };
export type Analysis = {
  s: Record<GroupKey, number>;
  fv: number; cer: number; pro: number; plate: number; extra: number; all: number;
  score: number | null; tips: Tip[];
};

export function analyze(items: Item[]): Analysis {
  const s = { V: 0, F: 0, CI: 0, CR: 0, LG: 0, PE: 0, CB: 0, RO: 0, PR: 0, LA: 0, GR: 0, DO: 0, BE: 0, NA: 0 } as Record<GroupKey, number>;
  for (const i of items) s[i.grp] = (s[i.grp] || 0) + (i.porz || 0) * i.qty;
  const fv = s.V + s.F, cer = s.CI + s.CR, pro = s.LG + s.PE + s.CB + s.RO + s.PR;
  const plate = fv + cer + pro, extra = s.LA + s.GR + s.DO, all = plate + extra;
  const r: Analysis = { s, fv, cer, pro, plate, extra, all, score: null, tips: [] };
  if (plate < 6) return r;

  const p = (x: number) => (100 * x) / plate;
  let sc = 100 - (Math.abs(p(fv) - 50) + Math.abs(p(cer) - 25) + Math.abs(p(pro) - 25)) * 0.7;
  if (s.V < s.F) sc -= 5;
  if (cer > 0 && s.CR > s.CI) sc -= 8;
  const red = pro ? (s.RO + s.PR) / pro : 0;
  if (red > 0.4) sc -= 10;
  if (s.PR > 0) sc -= 4;
  const sweet = all ? s.DO / all : 0;
  if (sweet > 0.25) sc -= 20; else if (sweet > 0.15) sc -= 10;
  r.score = Math.max(0, Math.min(100, Math.round(sc)));

  const T = r.tips;
  if (p(fv) < 40) T.push({ g: "V", t: "Più frutta e verdura", x: `Nel carrello sono il ${Math.round(p(fv))}% del piatto, l'obiettivo è metà. L'OMS indica almeno 400 g al giorno di frutta e verdura, circa 5 porzioni, patate escluse.`, src: ["oms", "harv"] });
  if (s.PR > 0 || red > 0.4) T.push({ g: "PR", t: "Meno salumi e carne rossa", x: "La IARC classifica le carni lavorate come cancerogene (gruppo 1) e la carne rossa come probabilmente cancerogena (2A). Il WCRF consiglia al massimo 350–500 g di carne rossa cotta a settimana e pochissimi salumi.", src: ["iarc", "wcrf"] });
  if (sweet > 0.15) T.push({ g: "DO", t: "Dolci, snack e bibite sono tanti", x: `Valgono il ${Math.round(sweet * 100)}% delle porzioni. L'OMS raccomanda di tenere gli zuccheri aggiunti sotto il 10% delle calorie, meglio sotto il 5%.`, src: ["omsZ"] });
  if (s.LG === 0) T.push({ g: "LG", t: "Aggiungi un legume", x: "Ceci, lenticchie o fagioli danno proteine, fibre e costano poco. Le linee guida CREA consigliano di consumarli più volte a settimana, anche al posto della carne.", src: ["crea"], add: "Lenticchie secche" });
  if (cer > 0 && s.CR > s.CI) T.push({ g: "CI", t: "Passa ai cereali integrali", x: "Una meta-analisi su oltre 45 studi lega 90 g al giorno di cereali integrali a un rischio di mortalità più basso del 17%. Il piatto di Harvard ne prevede un quarto.", src: ["aune", "harv"], add: "Pasta integrale" });
  if (s.PE === 0) T.push({ g: "PE", t: "Manca il pesce", x: "Le linee guida CREA suggeriscono il pesce 2–3 volte a settimana, anche surgelato o in scatola come sgombro e tonno.", src: ["crea"], add: "Sgombro in scatola" });
  if (s.V < s.F && p(fv) >= 40) T.push({ g: "V", t: "Più verdura che frutta", x: "Nel piatto di Harvard la verdura occupa più spazio della frutta: varia colori e tipi.", src: ["harv"] });
  if (s.GR === 0) T.push({ g: "GR", t: "Una manciata di frutta secca", x: "Nello studio PREDIMED la dieta mediterranea con frutta secca o olio extravergine ha ridotto di circa il 30% gli eventi cardiovascolari.", src: ["pred"], add: "Noci" });
  if (!T.length) T.push({ g: "V", t: "Carrello ben bilanciato", x: "Metà frutta e verdura, un quarto cereali integrali, un quarto proteine sane: è lo schema del piatto di Harvard.", src: ["harv"] });
  r.tips = T.slice(0, 3);
  return r;
}

export const scoreLevel = (n: number) => (n >= 80 ? "good" : n >= 60 ? "warn" : "bad") as "good" | "warn" | "bad";
export const scoreLabel = (n: number) => (n >= 80 ? "Carrello ben bilanciato" : n >= 60 ? "Quasi bilanciato" : "Carrello sbilanciato");
export type { AisleKey, GroupKey, Product };
