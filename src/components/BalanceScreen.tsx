import { Linking, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { GROUPS, SOURCES, type GroupKey } from "../data";
import { analyze, scoreLabel, scoreLevel, type State } from "../logic";
import { fonts, type Theme } from "../theme";
import { Chip } from "./ListScreen";
import { Dot, Label, Pill } from "./ui";

const card = (t: Theme) => ({ backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: 14 });

function Plate({ t, parts, label }: { t: Theme; parts: { v: number; c: string }[]; label: string }) {
  const tot = parts.reduce((s, p) => s + p.v, 0);
  const R = 70, cx = 90, cy = 90;
  let a = -Math.PI / 2;
  const shapes: React.ReactNode[] = [];
  parts.forEach((p, ix) => {
    if (!p.v) return;
    const da = (2 * Math.PI * p.v) / tot;
    if (da >= 2 * Math.PI - 1e-6) { shapes.push(<Circle key={ix} cx={cx} cy={cy} r={R} fill={p.c} />); return; }
    const x1 = cx + R * Math.cos(a), y1 = cy + R * Math.sin(a), x2 = cx + R * Math.cos(a + da), y2 = cy + R * Math.sin(a + da);
    shapes.push(<Path key={ix} d={`M${cx} ${cy}L${x1.toFixed(2)} ${y1.toFixed(2)}A${R} ${R} 0 ${da > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`} fill={p.c} stroke={t.surface} strokeWidth={1.5} />);
    a += da;
  });
  return (
    <Svg width="100%" height={150} viewBox="0 0 180 180" accessibilityLabel={label}>
      <Circle cx={90} cy={90} r={86} fill={t.bg} stroke={t.line} strokeWidth={2} />
      {tot ? shapes : <Circle cx={cx} cy={cy} r={R} fill={t.soft} />}
      <Circle cx={90} cy={90} r={78} fill="none" stroke={t.line} strokeWidth={1} />
    </Svg>
  );
}

export function BalanceScreen({ t, state, onAdd }: { t: Theme; state: State; onAdd: (name: string) => void }) {
  const A = analyze(state.items);
  if (A.score === null) {
    return (
      <View style={{ marginTop: 16, padding: 24, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.line, borderRadius: 14 }}>
        <Text style={{ textAlign: "center", fontFamily: fonts.body, color: t.muted, fontSize: 15 }}>Aggiungi qualche alimento in più alla lista per vedere l'equilibrio del carrello.</Text>
      </View>
    );
  }
  const lvl = scoreLevel(A.score);
  const food = state.items.filter((i) => i.grp !== "NA" && i.grp !== "BE").length;
  const order: GroupKey[] = ["V", "F", "CI", "CR", "LG", "PE", "CB", "RO", "PR"];
  const mine = order.map((g) => ({ v: A.s[g], c: t.group[g] }));
  const ref = [{ v: 30, c: t.group.V }, { v: 20, c: t.group.F }, { v: 25, c: t.group.CI }, { v: 25, c: t.group.LG }];
  const pct = (x: number) => (A.plate ? Math.round((100 * x) / A.plate) : 0);
  const rows: [string, number, number, GroupKey[]][] = [
    ["Frutta e verdura", A.fv, 50, ["V", "F"]],
    ["Cereali", A.cer, 25, ["CI", "CR"]],
    ["Proteine", A.pro, 25, ["LG", "PE", "CB", "RO", "PR"]],
  ];
  const extras: GroupKey[] = ["LA", "GR", "DO"];

  return (
    <View style={{ gap: 14, marginTop: 16 }}>
      <View style={[card(t), { flexDirection: "row", gap: 16, alignItems: "center", padding: 16 }]}>
        <Text style={{ fontFamily: fonts.display, fontSize: 50, color: t[lvl], letterSpacing: -1.5 }}>{A.score}</Text>
        <View style={{ flex: 1, gap: 4, alignItems: "flex-start" }}>
          <Pill t={t} level={lvl}>{scoreLabel(A.score)}</Pill>
          <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.muted }}>Punteggio su 100: quanto il carrello si avvicina al piatto sano, calcolato sulle porzioni stimate di {food} alimenti.</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[card(t), { flex: 1, padding: 12, alignItems: "center" }]}>
          <Label t={t}>Il tuo carrello</Label>
          <Plate t={t} parts={mine} label="Composizione del tuo carrello" />
        </View>
        <View style={[card(t), { flex: 1, padding: 12, alignItems: "center" }]}>
          <Label t={t}>Piatto sano</Label>
          <Plate t={t} parts={ref} label="Metà frutta e verdura, un quarto cereali integrali, un quarto proteine sane" />
        </View>
      </View>

      <View style={[card(t), { paddingHorizontal: 14, paddingVertical: 4 }]}>
        {rows.map(([n, v, ideal, gs]) => (
          <View key={n} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: t.line, gap: 7 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14.5, color: t.ink }}>{n} <Text style={{ fontFamily: fonts.bold }}>{pct(v)}%</Text></Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.muted }}>ideale {ideal}%</Text>
            </View>
            <View style={{ height: 8, borderRadius: 99, backgroundColor: t.soft, overflow: "hidden", flexDirection: "row" }}>
              {gs.map((g) => <View key={g} style={{ width: `${A.plate ? (100 * A.s[g]) / A.plate : 0}%`, backgroundColor: t.group[g] }} />)}
              <View style={{ position: "absolute", left: `${ideal}%`, top: 0, bottom: 0, width: 2, marginLeft: -1, backgroundColor: t.ink, opacity: 0.7 }} />
            </View>
          </View>
        ))}
        <View style={{ paddingVertical: 10, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.muted }}>Fuori dal piatto:</Text>
          {extras.map((g) => (
            <View key={g} style={{ flexDirection: "row", alignItems: "center", marginLeft: 6 }}>
              <Dot color={t.group[g]} size={8} />
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.muted }}>{GROUPS[g].split(",")[0].toLowerCase()} {A.all ? Math.round((100 * A.s[g]) / A.all) : 0}%</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ fontFamily: fonts.display, fontSize: 20, color: t.ink, marginTop: 4 }}>Cosa cambiare</Text>
      {A.tips.map((tip) => (
        <View key={tip.t} style={[card(t), { padding: 16, gap: 7 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Dot color={t.group[tip.g]} />
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: t.ink, flex: 1 }}>{tip.t}</Text>
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{tip.x}</Text>
          {tip.src.map((k) => (
            <Pressable key={k} onPress={() => Linking.openURL(SOURCES[k][1])} accessibilityRole="link" hitSlop={4}>
              <Text style={{ fontFamily: fonts.semi, fontSize: 13, color: t.accent }}>Fonte: {SOURCES[k][0]} ↗</Text>
            </Pressable>
          ))}
          {tip.add && !state.items.some((i) => i.name === tip.add) && (
            <View style={{ flexDirection: "row", marginTop: 4 }}><Chip t={t} label={tip.add} onPress={() => onAdd(tip.add!)} /></View>
          )}
        </View>
      ))}
      <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.muted }}>
        Le porzioni sono stimate dalle confezioni tipiche (es. 80 g di pasta, 150 g di frutta). Il calcolo riguarda la spesa, non quello che mangi, ed è un'indicazione, non un consiglio medico.
      </Text>
    </View>
  );
}
