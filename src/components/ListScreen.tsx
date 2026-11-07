import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AISLE, AISLES } from "../data";
import { eur, listTotal, quickPicks, search, type Item, type State } from "../logic";
import { fonts, type Theme } from "../theme";
import { Dot, Label } from "./ui";

type Props = {
  t: Theme;
  state: State;
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onPlus: (id: string) => void;
  onMinus: (item: Item) => void;
  onEdit: (id: string) => void;
  onClear: () => void;
};

export function Chip({ t, label, onPress }: { t: Theme; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Aggiungi ${label}`}
      style={({ pressed }) => ({ borderWidth: 1, borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 12 })}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: t.ink }}>+ {label}</Text>
    </Pressable>
  );
}

export function ListScreen({ t, state, onAdd, onToggle, onPlus, onMinus, onEdit, onClear }: Props) {
  const [q, setQ] = useState("");
  const sugg = search(state, q);
  const exact = sugg.some((c) => c.name.toLowerCase() === q.trim().toLowerCase());
  const quick = quickPicks(state);

  const add = (name: string) => {
    onAdd(name);
    setQ("");
  };

  return (
    <View>
      {/* aggiungi */}
      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: q ? t.accent : t.line, backgroundColor: t.surface, borderRadius: 14, paddingLeft: 14 }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth={2} strokeLinecap="round">
            <Path d="M12 5v14M5 12h14" />
          </Svg>
          <TextInput
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => add(sugg[0] && !exact ? sugg[0].name : q)}
            placeholder="Aggiungi un prodotto…"
            placeholderTextColor={t.muted}
            returnKeyType="done"
            submitBehavior="submit"
            autoCorrect={false}
            accessibilityLabel="Aggiungi un prodotto"
            style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 16, fontFamily: fonts.body, color: t.ink }}
          />
        </View>
        {q.trim().length > 0 && (
          <View style={{ marginTop: 6, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 4 }}>
            {sugg.map((c) => (
              <Pressable key={c.name} onPress={() => add(c.name)} style={({ pressed }) => ({ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, backgroundColor: pressed ? t.accentSoft : "transparent" })}>
                <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                  <Dot color={t.group[c.grp]} />
                  <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: t.ink }} numberOfLines={1}>{c.name}</Text>
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.muted }}>{AISLE[c.rep] ?? "Altro"} · {eur(c.price)}</Text>
              </Pressable>
            ))}
            {!exact && (
              <Pressable onPress={() => add(q)} style={({ pressed }) => ({ flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, backgroundColor: pressed ? t.accentSoft : "transparent" })}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: t.ink }}>Aggiungi «{q.trim()}»</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.muted }}>nuovo prodotto</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* soliti */}
      {quick.names.length > 0 && !q && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Label t={t}>{quick.label}</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {quick.names.map((n) => <Chip key={n} t={t} label={n} onPress={() => onAdd(n)} />)}
          </View>
        </View>
      )}

      {state.example && (
        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: t.accentSoft }}>
          <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, color: t.ink }}>Questa è una lista di esempio. Modificala o ricomincia da zero.</Text>
          <Pressable onPress={onClear} style={{ backgroundColor: t.accent, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: fonts.semi, color: t.accentInk }}>Svuota</Text>
          </Pressable>
        </View>
      )}

      {state.items.length === 0 && (
        <View style={{ marginTop: 28, padding: 24, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.line, borderRadius: 14 }}>
          <Text style={{ textAlign: "center", fontFamily: fonts.body, color: t.muted, fontSize: 15 }}>La lista è vuota.{"\n"}Scrivi un prodotto qui sopra o tocca uno dei tuoi soliti.</Text>
        </View>
      )}

      {AISLES.map(([k, label]) => {
        const its = state.items.filter((i) => i.rep === k).sort((a, b) => Number(a.done) - Number(b.done));
        if (!its.length) return null;
        return (
          <View key={k} style={{ marginTop: 18 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 4, paddingBottom: 6, borderBottomWidth: 1, borderColor: t.line }}>
              <Text style={{ fontFamily: fonts.semi, fontSize: 15, color: t.ink }}>{label}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.muted, fontVariant: ["tabular-nums"] }}>{eur(listTotal(its))}</Text>
            </View>
            {its.map((i) => <Row key={i.id} t={t} i={i} onToggle={onToggle} onPlus={onPlus} onMinus={onMinus} onEdit={onEdit} />)}
          </View>
        );
      })}
    </View>
  );
}

function Row({ t, i, onToggle, onPlus, onMinus, onEdit }: { t: Theme; i: Item } & Pick<Props, "onToggle" | "onPlus" | "onMinus" | "onEdit">) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: t.line }}>
      <Pressable
        onPress={() => onToggle(i.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: i.done }}
        accessibilityLabel={i.name}
        style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: i.done ? t.accent : t.line, backgroundColor: i.done ? t.accent : "transparent", alignItems: "center", justifyContent: "center", marginRight: 4 }}
      >
        {i.done && (
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.accentInk} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 12.5l4.5 4.5L19 7.5" />
          </Svg>
        )}
      </Pressable>
      <Pressable onPress={() => onEdit(i.id)} style={{ flex: 1, minWidth: 0 }} accessibilityHint="Modifica prezzo, quantità e reparto">
        <Text numberOfLines={1} style={{ fontFamily: fonts.semi, fontSize: 15, color: i.done ? t.muted : t.ink, textDecorationLine: i.done ? "line-through" : "none" }}>{i.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Dot color={t.group[i.grp]} size={8} />
          <Text numberOfLines={1} style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.muted }}>{i.unit ? `${i.unit} · ` : ""}{eur(i.price)}</Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: t.line, borderRadius: 10 }}>
        <Pressable onPress={() => onMinus(i)} accessibilityLabel="Meno" style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18, color: t.ink }}>−</Text>
        </Pressable>
        <Text style={{ minWidth: 20, textAlign: "center", fontFamily: fonts.semi, color: t.ink, fontVariant: ["tabular-nums"] }}>{i.qty}</Text>
        <Pressable onPress={() => onPlus(i.id)} accessibilityLabel="Più" style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18, color: t.ink }}>+</Text>
        </Pressable>
      </View>
      <Text style={{ minWidth: 62, textAlign: "right", fontFamily: fonts.semi, fontSize: 15, color: t.ink, fontVariant: ["tabular-nums"] }}>{eur(i.price * i.qty)}</Text>
    </View>
  );
}
