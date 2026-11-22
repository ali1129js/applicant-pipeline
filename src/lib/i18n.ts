import type { RoleId, Stage } from "../domain/schemas";
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
  boardHeading: string;
  fictionalNote: string;
  emptyColumn: string;
  daysInStage: (days: number) => string;
  rating: (value: number) => string;
  stageLabel: Record<Stage, string>;
  roleLabel: Record<RoleId, string>;
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
    boardHeading: "Hiring pipeline",
    fictionalNote: "All names and roles are made up for this demo.",
    emptyColumn: "No applicants in this stage.",
    daysInStage: (days) => (days === 1 ? "1 day in stage" : `${days} days in stage`),
    rating: (value) => `Rating ${value} of 5`,
    stageLabel: {
      applied: "Applied",
      screening: "Screening",
      interview: "Interview",
      offer: "Offer",
      hired: "Hired",
      rejected: "Rejected",
    },
    roleLabel: {
      "frontend-engineer": "Frontend Engineer",
      "backend-engineer": "Backend Engineer",
      "product-designer": "Product Designer",
      "customer-success": "Customer Success",
    },
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
    boardHeading: "Einstellungspipeline",
    fictionalNote: "Alle Namen und Rollen in dieser Demo sind erfunden.",
    emptyColumn: "Keine Bewerbungen in dieser Stufe.",
    daysInStage: (days) => (days === 1 ? "1 Tag in der Stufe" : `${days} Tage in der Stufe`),
    rating: (value) => `Bewertung ${value} von 5`,
    stageLabel: {
      applied: "Eingegangen",
      screening: "Prüfung",
      interview: "Gespräch",
      offer: "Angebot",
      hired: "Eingestellt",
      rejected: "Abgelehnt",
    },
    roleLabel: {
      "frontend-engineer": "Frontend-Ingenieur",
      "backend-engineer": "Backend-Ingenieur",
      "product-designer": "Produktdesigner",
      "customer-success": "Customer Success",
    },
  },
};
