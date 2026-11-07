import { useEffect } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, type Theme } from "../theme";

export function Dot({ color, size = 9 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, marginRight: 7 }} />;
}

export function Pill({ t, level, children }: { t: Theme; level?: "good" | "warn" | "bad"; children: React.ReactNode }) {
  const c = level ? t[level] : t.ink;
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 1, borderRadius: 99, backgroundColor: level ? c + "2E" : t.soft }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c }}>{children}</Text>
    </View>
  );
}

export function Label({ t, children, style }: { t: Theme; children: React.ReactNode; style?: object }) {
  return <Text style={[{ fontFamily: fonts.semi, fontSize: 12, letterSpacing: 0.7, textTransform: "uppercase", color: t.muted }, style]}>{children}</Text>;
}

type BtnKind = "primary" | "ghost" | "danger";
export function Btn({ t, kind = "primary", title, onPress, disabled }: { t: Theme; kind?: BtnKind; title: string; onPress: () => void; disabled?: boolean }) {
  const primary = kind === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: primary ? t.accent : t.surface,
        borderWidth: primary ? 0 : 1, borderColor: t.line,
        borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: primary ? t.accentInk : kind === "danger" ? t.bad : t.ink }}>{title}</Text>
    </Pressable>
  );
}

export function Field({ t, label, ...props }: { t: Theme; label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={{ fontFamily: fonts.semi, fontSize: 13, color: t.muted }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.muted}
        {...props}
        style={{ borderWidth: 1.5, borderColor: t.line, backgroundColor: t.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16, fontFamily: fonts.body, color: t.ink }}
      />
    </View>
  );
}

/** Pannello che sale dal basso. */
export function Sheet({ t, visible, onClose, title, children }: { t: Theme; visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]} onPress={onClose} accessibilityLabel="Chiudi" />
        <View style={{ flex: 1 }} pointerEvents="box-none" />
        <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "88%", width: "100%", maxWidth: 560, alignSelf: "center" }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 20 + insets.bottom, gap: 14 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.line, alignSelf: "center", marginTop: -8 }} />
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.ink }}>{title}</Text>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export type ToastMsg = { text: string; undo?: () => void; key: number } | null;
export function Toast({ t, msg, onDone, bottom }: { t: Theme; msg: ToastMsg; onDone: () => void; bottom: number }) {
  useEffect(() => {
    if (!msg) return;
    const h = setTimeout(onDone, msg.undo ? 5000 : 2200);
    return () => clearTimeout(h);
  }, [msg]);
  if (!msg) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom, alignItems: "center" }}>
      <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", gap: 16, alignItems: "center", backgroundColor: t.ink, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16 }}>
        <Text style={{ color: t.bg, fontFamily: fonts.semi, fontSize: 14 }}>{msg.text}</Text>
        {msg.undo && (
          <Pressable onPress={() => { msg.undo!(); onDone(); }} hitSlop={10}>
            <Text style={{ color: t.bg, fontFamily: fonts.bold, fontSize: 14, textDecorationLine: "underline" }}>Annulla</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
