import type { LocaleName, ThemeName } from "./types";

export interface UIStrings {
  skipToContent: string;
  title: string;
  company: string;
  subtitle: string;
  documentTitle: string;
  theme: string;
  language: string;
  localeEn: string;
  localeDe: string;
  themeLabel: Record<ThemeName, string>;
  animatedBackground: string;
  animatedBackgroundReduced: string;
  comingSoonHeading: string;
  comingSoonBody: string;
  fictionalNote: string;
}

export const COMPANY = "Demo Talent GmbH";

export const STRINGS: Record<LocaleName, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    title: "Applicant Pipeline",
    company: COMPANY,
    subtitle: "A hiring board for a fictional talent team.",
    documentTitle: "Applicant Pipeline",
    theme: "Theme",
    language: "Language",
    localeEn: "EN",
    localeDe: "DE",
    themeLabel: { khaki: "Khaki", graphite: "Graphite", midnight: "Midnight" },
    animatedBackground: "Animated background",
    animatedBackgroundReduced: "Animated background (reduced motion is on)",
    comingSoonHeading: "The board is next",
    comingSoonBody:
      "This is the app shell: themes, motion and language. The pipeline board, with stages from Applied to Hired, will land in the following updates.",
    fictionalNote: "All names and roles are made up for this demo.",
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    title: "Bewerberpipeline",
    company: COMPANY,
    subtitle: "Ein Einstellungsboard für ein fiktives Talent-Team.",
    documentTitle: "Bewerberpipeline",
    theme: "Thema",
    language: "Sprache",
    localeEn: "EN",
    localeDe: "DE",
    themeLabel: { khaki: "Khaki", graphite: "Graphit", midnight: "Mitternacht" },
    animatedBackground: "Animierter Hintergrund",
    animatedBackgroundReduced: "Animierter Hintergrund (reduzierte Bewegung ist aktiv)",
    comingSoonHeading: "Als Nächstes kommt das Board",
    comingSoonBody:
      "Das ist die App-Hülle: Themes, Bewegung und Sprache. Das Pipeline-Board mit den Stufen von Eingegangen bis Eingestellt folgt in den nächsten Schritten.",
    fictionalNote: "Alle Namen und Rollen in dieser Demo sind erfunden.",
  },
};
