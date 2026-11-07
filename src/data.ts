// Catalogo: nome | reparto | gruppo | prezzo € | confezione | porzioni stimate
export type AisleKey = "fv" | "pc" | "cp" | "lu" | "di" | "su" | "be" | "do" | "ca" | "al";
export type GroupKey = "V" | "F" | "CI" | "CR" | "LG" | "PE" | "CB" | "RO" | "PR" | "LA" | "GR" | "DO" | "BE" | "NA";

export const AISLES: [AisleKey, string][] = [
  ["fv", "Frutta e verdura"], ["pc", "Pane, pasta e cereali"], ["cp", "Carne e pesce"], ["lu", "Latticini e uova"],
  ["di", "Dispensa"], ["su", "Surgelati"], ["be", "Bevande"], ["do", "Dolci e snack"], ["ca", "Casa e igiene"], ["al", "Altro"],
];
export const AISLE = Object.fromEntries(AISLES) as Record<AisleKey, string>;

export const GROUPS: Record<GroupKey, string> = {
  V: "Verdura", F: "Frutta", CI: "Cereali integrali", CR: "Cereali raffinati e patate",
  LG: "Legumi e tofu", PE: "Pesce", CB: "Pollo, tacchino, uova", RO: "Carne rossa", PR: "Salumi e carni lavorate",
  LA: "Latticini", GR: "Frutta secca e grassi buoni", DO: "Dolci, snack, bibite, alcol",
  BE: "Acqua, caffè, tè", NA: "Non alimentare",
};

export type Product = { name: string; rep: AisleKey; grp: GroupKey; price: number; unit: string; porz: number };

const RAW = `Mele|fv|F|2.2|1 kg|6
Banane|fv|F|1.9|1 kg|6
Arance|fv|F|1.8|1 kg|5
Pere|fv|F|2.5|1 kg|6
Kiwi|fv|F|3|1 kg|8
Clementine|fv|F|2.2|1 kg|7
Uva|fv|F|3.5|1 kg|6
Fragole|fv|F|3.5|250 g|2
Frutti di bosco|fv|F|3|125 g|1
Limoni|fv|F|2.5|1 kg|0
Pomodori|fv|V|2.8|1 kg|5
Pomodorini|fv|V|2.5|500 g|2
Insalata|fv|V|1.5|1 cespo|3
Insalata in busta|fv|V|1.6|125 g|2
Rucola|fv|V|1.5|125 g|2
Zucchine|fv|V|2.4|1 kg|5
Carote|fv|V|1.3|1 kg|6
Spinaci|fv|V|2.5|500 g|2
Broccoli|fv|V|2.8|1 kg|4
Cavolfiore|fv|V|2.2|1 pz|4
Melanzane|fv|V|2.4|1 kg|4
Peperoni|fv|V|3|1 kg|5
Finocchi|fv|V|2.5|1 kg|4
Zucca|fv|V|1.8|1 kg|4
Cetrioli|fv|V|2|1 kg|4
Funghi|fv|V|2.5|250 g|2
Cipolle|fv|V|1.5|1 kg|3
Aglio|fv|V|0.8|1 testa|0
Basilico|fv|V|1.2|1 vaso|0
Patate|fv|CR|1.5|1 kg|5
Avocado|fv|GR|1.5|1 pz|2
Pane|pc|CR|1.8|500 g|8
Pane integrale|pc|CI|2.4|500 g|8
Pasta|pc|CR|1.2|500 g|6
Pasta integrale|pc|CI|1.6|500 g|6
Riso|pc|CR|2.2|1 kg|12
Riso integrale|pc|CI|2.8|1 kg|12
Farro|pc|CI|2.5|500 g|6
Orzo|pc|CI|2|500 g|6
Fiocchi d'avena|pc|CI|2|500 g|12
Gallette di riso|pc|CR|1.5|130 g|4
Cracker|pc|CR|1.5|500 g|6
Fette biscottate|pc|CR|1.8|1 pacco|10
Cereali per colazione|pc|CR|3|375 g|10
Piadine|pc|CR|1.9|4 pz|4
Farina|pc|CR|1|1 kg|0
Petto di pollo|cp|CB|5|500 g|4
Fesa di tacchino|cp|CB|5|400 g|3
Macinato di manzo|cp|RO|5|500 g|4
Bistecca di manzo|cp|RO|8|400 g|2
Carne di maiale|cp|RO|4.5|500 g|4
Salsiccia|cp|PR|4.5|400 g|3
Prosciutto crudo|cp|PR|3.5|100 g|2
Prosciutto cotto|cp|PR|2.5|120 g|2
Salame|cp|PR|2.5|100 g|2
Bresaola|cp|PR|4|100 g|2
Wurstel|cp|PR|1.5|250 g|3
Salmone|cp|PE|5.5|250 g|2
Merluzzo|cp|PE|5|400 g|3
Orata|cp|PE|7|1 pz|2
Gamberi|cp|PE|6|300 g|2
Uova|lu|CB|2.6|6 pz|3
Latte|lu|LA|1.4|1 L|4
Bevanda vegetale|lu|LA|1.8|1 L|4
Yogurt bianco|lu|LA|1.8|4×125 g|4
Yogurt greco|lu|LA|1.5|170 g|1
Yogurt alla frutta|lu|LA|1.8|4×125 g|4
Mozzarella|lu|LA|1.3|125 g|1
Parmigiano|lu|LA|4|200 g|5
Ricotta|lu|LA|1.6|250 g|2
Stracchino|lu|LA|1.8|200 g|2
Burro|lu|DO|2.3|250 g|4
Tofu|lu|LG|2.5|200 g|2
Ceci in scatola|di|LG|1|400 g|2
Fagioli in scatola|di|LG|1|400 g|2
Lenticchie secche|di|LG|2|500 g|10
Ceci secchi|di|LG|2|500 g|10
Tonno in scatola|di|PE|3.5|3×80 g|3
Sgombro in scatola|di|PE|2.5|125 g|1
Passata di pomodoro|di|V|1.2|700 g|4
Pelati|di|V|1|400 g|2
Olio extravergine d'oliva|di|GR|9|1 L|0
Noci|di|GR|3|200 g|7
Mandorle|di|GR|3.5|200 g|7
Pesto|di|GR|2.5|190 g|3
Marmellata|di|DO|2.5|340 g|6
Miele|di|DO|5|500 g|0
Zucchero|di|DO|1.2|1 kg|0
Maionese|di|DO|1.8|250 ml|0
Sale|di|NA|0.5|1 kg|0
Caffè|di|BE|4|250 g|0
Tè|di|BE|2|20 filtri|0
Verdure miste surgelate|su|V|2|750 g|5
Spinaci surgelati|su|V|1.6|750 g|5
Minestrone surgelato|su|V|2|1 kg|5
Piselli surgelati|su|LG|1.8|450 g|3
Bastoncini di pesce|su|PE|3|15 pz|4
Pizza surgelata|su|DO|2.5|1 pz|2
Gelato|su|DO|3.5|500 g|5
Acqua naturale|be|BE|2.2|6×1,5 L|0
Acqua frizzante|be|BE|2.2|6×1,5 L|0
Succo di frutta|be|DO|1.5|1 L|4
Bibite gassate|be|DO|1.6|1,5 L|4
Birra|be|DO|3.5|6×33 cl|6
Vino|be|DO|6|75 cl|5
Biscotti|do|DO|2.2|500 g|10
Merendine|do|DO|2.5|10 pz|10
Cioccolato fondente|do|DO|2|100 g|4
Crema spalmabile|do|DO|3.5|400 g|10
Patatine|do|DO|1.8|150 g|5
Carta igienica|ca|NA|3.5|8 rotoli|0
Carta da cucina|ca|NA|2.5|4 rotoli|0
Detersivo piatti|ca|NA|1.8|1 L|0
Detersivo lavatrice|ca|NA|6|30 lavaggi|0
Sapone mani|ca|NA|1.5|1 pz|0
Shampoo|ca|NA|3|1 pz|0
Dentifricio|ca|NA|2|1 pz|0
Sacchi spazzatura|ca|NA|2|1 rotolo|0
Spugne|ca|NA|1.5|3 pz|0`;

export const CATALOG: Product[] = RAW.split("\n").map((l) => {
  const [name, rep, grp, p, unit, s] = l.split("|");
  return { name, rep: rep as AisleKey, grp: grp as GroupKey, price: +p, unit, porz: +s };
});

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
export const BYNAME: Record<string, Product> = Object.fromEntries(CATALOG.map((c) => [norm(c.name), c]));

export type SourceKey = "oms" | "omsZ" | "iarc" | "wcrf" | "crea" | "harv" | "aune" | "pred";
export const SOURCES: Record<SourceKey, [string, string]> = {
  oms: ["OMS, Healthy diet – scheda informativa (2020)", "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"],
  omsZ: ["OMS, Guideline: sugars intake for adults and children (2015)", "https://www.who.int/publications/i/item/9789241549028"],
  iarc: ["IARC Monografia vol. 114, carne rossa e lavorata (2015)", "https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_E.pdf"],
  wcrf: ["World Cancer Research Fund, Limit red and processed meat", "https://www.wcrf.org/research-policy/evidence-for-our-recommendations/limit-red-processed-meat/"],
  crea: ["CREA, Linee guida per una sana alimentazione (2018)", "https://www.crea.gov.it/web/alimenti-e-nutrizione/-/linee-guida-per-una-sana-alimentazione-2018"],
  harv: ["Harvard T.H. Chan School of Public Health, Healthy Eating Plate", "https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/"],
  aune: ["Aune et al., BMJ 2016; 353:i2716 (cereali integrali e mortalità)", "https://www.bmj.com/content/353/bmj.i2716"],
  pred: ["Estruch et al., NEJM 2018 – studio PREDIMED", "https://www.nejm.org/doi/full/10.1056/NEJMoa1800389"],
};
