import { useColorScheme } from "react-native";
import type { GroupKey } from "./data";

const light = {
  bg: "#F2F5F1", surface: "#FFFFFF", ink: "#14201A", muted: "#5D6B63", line: "#DCE3DD", soft: "#E8EEE9",
  accent: "#2B44D6", accentInk: "#FFFFFF", accentSoft: "#E3E7FB",
  good: "#1E8A4C", warn: "#B86E00", bad: "#C3362C", scrim: "rgba(0,0,0,0.38)",
};
const dark: typeof light = {
  bg: "#0E1411", surface: "#17201B", ink: "#E7EEE9", muted: "#97A59D", line: "#29342E", soft: "#1F2924",
  accent: "#8195FF", accentInk: "#0E1411", accentSoft: "#232C52",
  good: "#4CC27F", warn: "#E3A13B", bad: "#F06A5F", scrim: "rgba(0,0,0,0.55)",
};

const groupLight: Record<GroupKey, string> = {
  V: "#3E9B4F", F: "#F08A24", CI: "#B98A22", CR: "#E3CB8F", LG: "#8466C4", PE: "#2D8DB3",
  CB: "#D98FAE", RO: "#B2433A", PR: "#7A2A25", LA: "#8DB6DD", GR: "#71862A", DO: "#E0558A",
  BE: "#8A968F", NA: "#8A968F",
};
const groupDark: Record<GroupKey, string> = { ...groupLight, CR: "#9C8A5C", PR: "#A8473F", CB: "#C77E9C" };

export type Theme = typeof light & { group: Record<GroupKey, string>; dark: boolean };

export function useTheme(): Theme {
  const isDark = useColorScheme() === "dark";
  return isDark ? { ...dark, group: groupDark, dark: true } : { ...light, group: groupLight, dark: false };
}

export const fonts = {
  display: "BricolageGrotesque_800ExtraBold",
  displaySemi: "BricolageGrotesque_600SemiBold",
  body: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semi: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
};
