import { BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque";
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { BalanceScreen } from "./src/components/BalanceScreen";
import { ListScreen } from "./src/components/ListScreen";
import { Btn, Field, Label, Pill, Sheet, Toast, type ToastMsg } from "./src/components/ui";
import { AISLES, GROUPS, type AisleKey, type GroupKey } from "./src/data";
import { analyze, eur, eur0, listTotal, MESI, parseNum, scoreLevel, spentThisMonth, type Item, type State } from "./src/logic";
import { useStore } from "./src/store";
import { fonts, useTheme, type Theme } from "./src/theme";

export default function App() {
  const [loaded] = useFonts({
    BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold,
    Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold,
  });
  return (
    <SafeAreaProvider>
      <Main fontsReady={loaded} />
    </SafeAreaProvider>
  );
}

type SheetKind = { k: "edit"; id: string; isNew: boolean } | { k: "close" } | { k: "settings" } | null;

function Main({ fontsReady }: { fontsReady: boolean }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { state, actions } = useStore();
  const [view, setView] = useState<"lista" | "equilibrio">("lista");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [toast, setToast] = useState<ToastMsg>(null);
  const say = (text: string, undo?: () => void) => setToast({ text, undo, key: Date.now() });

  if (!state || !fontsReady) {
    return <View style={{ flex: 1, backgroundColor: t.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={t.accent} /></View>;
  }

  const add = (name: string) => {
    const r = actions.add(name);
    if (!r) return;
    if (r.isNew) setSheet({ k: "edit", id: r.id, isNew: true });
    else if (r.qty > 1) say(`${name}: ${r.qty}`);
  };
  const minus = (i: Item) => {
    if (i.qty > 1) actions.minus(i.id);
    else say(`${i.name} tolto`, actions.remove(i.id));
  };
  const A = analyze(state.items);
  const total = listTotal(state.items);
  const doneN = state.items.filter((i) => i.done).length;
  const footH = 74 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: footH + 30, paddingHorizontal: 16, width: "100%", maxWidth: 560, alignSelf: "center" }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.6, color: t.ink }}>La mia spesa</Text>
          <Pressable onPress={() => setSheet({ k: "settings" })} accessibilityLabel="Budget e storico" style={{ width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth={2} strokeLinecap="round">
              <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><Circle cx={16} cy={7} r={2} /><Circle cx={10} cy={17} r={2} />
            </Svg>
          </Pressable>
        </View>

        <Budget t={t} state={state} plan={total} />

        <View style={{ marginTop: 14, flexDirection: "row", backgroundColor: t.soft, borderRadius: 12, padding: 4, gap: 4 }} accessibilityRole="tablist">
          {(["lista", "equilibrio"] as const).map((v) => {
            const on = view === v;
            return (
              <Pressable key={v} onPress={() => setView(v)} accessibilityRole="tab" accessibilityState={{ selected: on }}
                style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 10, borderRadius: 9, backgroundColor: on ? t.surface : "transparent" }}>
                <Text style={{ fontFamily: fonts.semi, fontSize: 15, color: on ? t.ink : t.muted }}>{v === "lista" ? "Lista" : "Equilibrio"}</Text>
                {v === "equilibrio" && <Pill t={t} level={A.score === null ? undefined : scoreLevel(A.score)}>{A.score ?? "–"}</Pill>}
              </Pressable>
            );
          })}
        </View>

        {view === "lista" ? (
          <ListScreen t={t} state={state} onAdd={add} onToggle={actions.toggle} onPlus={actions.plus} onMinus={minus}
            onEdit={(id) => setSheet({ k: "edit", id, isNew: false })} onClear={actions.clearList} />
        ) : (
          <BalanceScreen t={t} state={state} onAdd={(n) => { add(n); say(`${n} aggiunto alla lista`); }} />
        )}
      </ScrollView>

      {/* totale in basso */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: t.bg, borderTopWidth: 1, borderColor: t.line, paddingTop: 12, paddingBottom: 12 + insets.bottom, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, width: "100%", maxWidth: 560, alignSelf: "center" }}>
          <View>
            <Text style={{ fontFamily: fonts.display, fontSize: 23, color: t.ink, letterSpacing: -0.4 }}>{eur(total)}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.muted }}>{state.items.length ? `Stima · ${doneN} di ${state.items.length} presi` : "Lista vuota"}</Text>
          </View>
          <Btn t={t} title="Ho fatto la spesa" onPress={() => setSheet({ k: "close" })} disabled={!state.items.length} />
        </View>
      </View>

      <Toast t={t} msg={toast} onDone={() => setToast(null)} bottom={footH + 12} />

      {sheet?.k === "edit" && (
        <EditSheet t={t} item={state.items.find((i) => i.id === sheet.id)} isNew={sheet.isNew} onClose={() => setSheet(null)}
          onSave={(patch) => { actions.save(sheet.id, patch); setSheet(null); }}
          onDelete={(i) => { setSheet(null); say(`${i.name} tolto`, actions.remove(i.id)); }} />
      )}
      {sheet?.k === "close" && (
        <CloseSheet t={t} state={state} onClose={() => setSheet(null)} onSave={(v) => { actions.closeShop(v); setSheet(null); say(`Registrati ${eur(v)}`); }} />
      )}
      {sheet?.k === "settings" && (
        <SettingsSheet t={t} state={state} onClose={() => setSheet(null)}
          onBudget={(b) => { actions.setBudget(b); say("Budget aggiornato"); }}
          onClear={() => { actions.clearList(); setSheet(null); }}
          onDeleteShop={actions.deleteShop} />
      )}
    </View>
  );
}

function Budget({ t, state, plan }: { t: Theme; state: State; plan: number }) {
  const b = state.budget || 0, spent = spentThisMonth(state), left = b - spent - plan, over = left < 0;
  const w = (x: number) => (b ? Math.max(0, Math.min(100, (100 * x) / b)) : 0);
  return (
    <View style={{ marginTop: 14, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <Label t={t}>Budget di {MESI[new Date().getMonth()]}</Label>
        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: t.ink }}>{eur0(spent)} <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: t.muted }}>spesi di {eur0(b)}</Text></Text>
      </View>
      <View style={{ height: 10, borderRadius: 99, backgroundColor: t.soft, overflow: "hidden", flexDirection: "row" }}
        accessibilityLabel={`Spesi ${eur0(spent)}, lista ${eur0(plan)}, budget ${eur0(b)}`}>
        <View style={{ width: `${w(spent)}%`, backgroundColor: t.ink }} />
        <View style={{ width: `${Math.min(w(plan), 100 - w(spent))}%`, backgroundColor: over ? t.bad : t.accent, opacity: over ? 1 : 0.55 }} />
      </View>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: t.muted }}>
        {plan ? (
          <>Con questa lista ({eur(plan)}) {over
            ? <Text style={{ fontFamily: fonts.bold, color: t.bad }}>sfori di {eur0(-left)}</Text>
            : <>ti restano <Text style={{ fontFamily: fonts.bold, color: t.ink }}>{eur0(left)}</Text></>}.</>
        ) : (
          <>Ti restano <Text style={{ fontFamily: fonts.bold, color: t.ink }}>{eur0(b - spent)}</Text> per il mese.</>
        )}
      </Text>
    </View>
  );
}

function Choice<K extends string>({ t, options, value, onChange }: { t: Theme; options: [K, string][]; value: K; onChange: (k: K) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {options.map(([k, l]) => {
        const on = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="radio" accessibilityState={{ selected: on }}
            style={{ borderWidth: 1, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: on ? fonts.semi : fonts.body, fontSize: 13.5, color: t.ink }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EditSheet({ t, item, isNew, onClose, onSave, onDelete }: {
  t: Theme; item?: Item; isNew: boolean; onClose: () => void; onSave: (p: Partial<Item>) => void; onDelete: (i: Item) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [qty, setQty] = useState(String(item?.qty ?? 1));
  const [price, setPrice] = useState(item ? item.price.toFixed(2).replace(".", ",") : "");
  const [rep, setRep] = useState<AisleKey>(item?.rep ?? "al");
  const [grp, setGrp] = useState<GroupKey>(item?.grp ?? "NA");
  if (!item) return null;
  return (
    <Sheet t={t} visible onClose={onClose} title={isNew ? "Nuovo prodotto" : item.name}>
      {isNew && <Field t={t} label="Nome" value={name} onChangeText={setName} />}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Field t={t} label="Quantità" value={qty} onChangeText={setQty} keyboardType="number-pad" />
        <Field t={t} label="Prezzo (€), lo ricordo" value={price} onChangeText={setPrice} keyboardType="decimal-pad" autoFocus={isNew} selectTextOnFocus />
      </View>
      <Label t={t}>Reparto</Label>
      <Choice t={t} options={AISLES} value={rep} onChange={setRep} />
      <Label t={t}>Tipo di alimento (per l'equilibrio)</Label>
      <Choice t={t} options={Object.entries(GROUPS) as [GroupKey, string][]} value={grp} onChange={setGrp} />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <Btn t={t} kind="danger" title="Togli" onPress={() => onDelete(item)} />
        <View style={{ flex: 1 }} />
        <Btn t={t} kind="ghost" title="Annulla" onPress={onClose} />
        <Btn t={t} title="Salva" onPress={() => onSave({
          name: isNew && name.trim() ? name.trim() : item.name,
          qty: Math.max(1, Math.round(parseNum(qty)) || 1),
          price: Math.max(0, parseNum(price)),
          rep, grp,
        })} />
      </View>
    </Sheet>
  );
}

function CloseSheet({ t, state, onClose, onSave }: { t: Theme; state: State; onClose: () => void; onSave: (v: number) => void }) {
  const done = state.items.filter((i) => i.done);
  const use = done.length ? done : state.items;
  const [v, setV] = useState(listTotal(use).toFixed(2).replace(".", ","));
  return (
    <Sheet t={t} visible onClose={onClose} title="Com'è andata?">
      <Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.muted }}>
        {done.length ? `Chiudo i ${done.length} prodotti presi; gli altri restano in lista per la prossima volta.` : `Chiudo tutta la lista (${use.length} prodotti).`}
      </Text>
      <Field t={t} label="Totale dello scontrino (€)" value={v} onChangeText={setV} keyboardType="decimal-pad" autoFocus selectTextOnFocus />
      <View style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end" }}>
        <Btn t={t} kind="ghost" title="Annulla" onPress={onClose} />
        <Btn t={t} title="Registra spesa" onPress={() => onSave(Math.max(0, parseNum(v)))} />
      </View>
    </Sheet>
  );
}

function SettingsSheet({ t, state, onClose, onBudget, onClear, onDeleteShop }: {
  t: Theme; state: State; onClose: () => void; onBudget: (b: number) => void; onClear: () => void; onDeleteShop: (i: number) => void;
}) {
  const [b, setB] = useState(String(state.budget));
  const byMonth: Record<string, number> = {};
  for (const h of state.history) byMonth[h.d.slice(0, 7)] = (byMonth[h.d.slice(0, 7)] || 0) + h.t;
  const months = Object.entries(byMonth).sort().reverse().slice(0, 6);
  const hist = state.history.map((h, ix) => ({ h, ix })).reverse().slice(0, 12);
  const row = { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 9, borderBottomWidth: 1, borderColor: t.line };
  return (
    <Sheet t={t} visible onClose={onClose} title="Budget e storico">
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
        <Field t={t} label="Budget mensile per la spesa (€)" value={b} onChangeText={setB} keyboardType="number-pad" />
        <Btn t={t} title="Salva" onPress={() => onBudget(Math.max(0, Math.round(parseNum(b))))} />
      </View>
      {months.length > 0 && (
        <View>
          <Label t={t}>Totale per mese</Label>
          {months.map(([k, v]) => {
            const [y, m] = k.split("-");
            return (
              <View key={k} style={row}>
                <Text style={{ fontFamily: fonts.body, color: t.ink, fontSize: 15 }}>{MESI[+m - 1]} {y}</Text>
                <Text style={{ fontFamily: fonts.bold, color: v > state.budget ? t.bad : t.ink, fontSize: 15 }}>{eur(v)}</Text>
              </View>
            );
          })}
        </View>
      )}
      <View>
        <Label t={t}>Ultime spese</Label>
        {hist.length ? hist.map(({ h, ix }) => (
          <View key={ix} style={row}>
            <Text style={{ fontFamily: fonts.body, color: t.ink, fontSize: 15 }}>
              {new Date(h.d + "T12:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })} · {h.n} prodotti
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontFamily: fonts.bold, color: t.ink, fontSize: 15 }}>{eur(h.t)}</Text>
              <Pressable onPress={() => onDeleteShop(ix)} accessibilityLabel="Elimina questa spesa" hitSlop={8}>
                <Text style={{ color: t.muted, fontSize: 18 }}>×</Text>
              </Pressable>
            </View>
          </View>
        )) : (
          <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 14, marginTop: 6 }}>Quando tocchi «Ho fatto la spesa» il totale finisce qui e nel budget del mese.</Text>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Btn t={t} kind="danger" title="Svuota la lista" onPress={onClear} />
        <View style={{ flex: 1 }} />
        <Btn t={t} kind="ghost" title="Chiudi" onPress={onClose} />
      </View>
    </Sheet>
  );
}
