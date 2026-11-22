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
  moveTo: (name: string) => string;
  moveError: {
    "already-there": string;
    "rejected-needs-reason": string;
    "hired-is-terminal": string;
  };
  rejectTitle: string;
  rejectBody: (name: string) => string;
  rejectReasonLabel: string;
  rejectConfirm: string;
  rejectCancel: string;
  resetDemo: string;
  resetTitle: string;
  resetBody: string;
  resetConfirm: string;
  resetCancel: string;
  search: string;
  searchPlaceholder: string;
  filterRole: string;
  filterRating: string;
  filterAll: string;
  sortBy: string;
  sortName: string;
  sortRating: string;
  sortDays: string;
  viewProfile: (name: string) => string;
  closeDrawer: string;
  profileHeading: string;
  emailLabel: string;
  appliedLabel: string;
  timelineHeading: string;
  timelineEntered: (date: string) => string;
  timelineExited: (date: string) => string;
  notesHeading: string;
  notesEmpty: string;
  addNote: string;
  notePlaceholder: string;
  deleteNote: string;
  ratingLabel: string;
  statsHeading: string;
  statsConversion: string;
  statsMedian: string;
  statsRoles: string;
  statsReached: (count: number) => string;
  statsConversionOf: (pct: number) => string;
  statsMedianDays: (days: number) => string;
  statsNoMedian: string;
  statsTotal: (count: number) => string;
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
    moveTo: (name) => `Move ${name}`,
    moveError: {
      "already-there": "This applicant is already in that stage.",
      "rejected-needs-reason": "Moving to Rejected needs a reason.",
      "hired-is-terminal": "Hired applicants cannot be moved.",
    },
    rejectTitle: "Reason for rejection",
    rejectBody: (name) => `Please give a reason for rejecting ${name}.`,
    rejectReasonLabel: "Reason",
    rejectConfirm: "Reject",
    rejectCancel: "Cancel",
    resetDemo: "Reset demo",
    resetTitle: "Reset the demo board?",
    resetBody:
      "This replaces the current board with the original seeded applicants. It cannot be undone.",
    resetConfirm: "Reset",
    resetCancel: "Cancel",
    search: "Search",
    searchPlaceholder: "Search by name",
    filterRole: "Role",
    filterRating: "Rating",
    filterAll: "All",
    sortBy: "Sort",
    sortName: "Name",
    sortRating: "Rating",
    sortDays: "Days in stage",
    viewProfile: (name) => `View ${name}`,
    closeDrawer: "Close details",
    profileHeading: "Profile",
    emailLabel: "Email",
    appliedLabel: "Applied",
    timelineHeading: "Stage history",
    timelineEntered: (date) => `Entered ${date}`,
    timelineExited: (date) => `Left ${date}`,
    notesHeading: "Notes",
    notesEmpty: "No notes yet.",
    addNote: "Add note",
    notePlaceholder: "Write a note",
    deleteNote: "Delete note",
    ratingLabel: "Rating",
    statsHeading: "Pipeline stats",
    statsConversion: "Conversion",
    statsMedian: "Median days in stage",
    statsRoles: "Applicants by role",
    statsReached: (count) => (count === 1 ? "1 reached" : `${count} reached`),
    statsConversionOf: (pct) => `${pct}% of previous stage`,
    statsMedianDays: (days) => (days === 1 ? "1 day" : `${days} days`),
    statsNoMedian: "No samples yet",
    statsTotal: (count) => (count === 1 ? "1 applicant in total" : `${count} applicants in total`),
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
    moveTo: (name) => `${name} verschieben`,
    moveError: {
      "already-there": "Diese Bewerbung ist bereits in dieser Stufe.",
      "rejected-needs-reason": "Für eine Ablehnung ist ein Grund nötig.",
      "hired-is-terminal": "Eingestellte Personen können nicht verschoben werden.",
    },
    rejectTitle: "Grund der Ablehnung",
    rejectBody: (name) => `Bitte einen Grund angeben, warum ${name} abgelehnt wird.`,
    rejectReasonLabel: "Grund",
    rejectConfirm: "Ablehnen",
    rejectCancel: "Abbrechen",
    resetDemo: "Demo zurücksetzen",
    resetTitle: "Demo-Board zurücksetzen?",
    resetBody:
      "Das aktuelle Board wird durch die ursprünglichen Demodaten ersetzt. Das lässt sich nicht rückgängig machen.",
    resetConfirm: "Zurücksetzen",
    resetCancel: "Abbrechen",
    search: "Suche",
    searchPlaceholder: "Nach Namen suchen",
    filterRole: "Rolle",
    filterRating: "Bewertung",
    filterAll: "Alle",
    sortBy: "Sortierung",
    sortName: "Name",
    sortRating: "Bewertung",
    sortDays: "Tage in der Stufe",
    viewProfile: (name) => `${name} ansehen`,
    closeDrawer: "Details schliessen",
    profileHeading: "Profil",
    emailLabel: "E-Mail",
    appliedLabel: "Eingegangen",
    timelineHeading: "Stufenverlauf",
    timelineEntered: (date) => `Eingetreten ${date}`,
    timelineExited: (date) => `Verlassen ${date}`,
    notesHeading: "Notizen",
    notesEmpty: "Noch keine Notizen.",
    addNote: "Notiz hinzufügen",
    notePlaceholder: "Notiz schreiben",
    deleteNote: "Notiz löschen",
    ratingLabel: "Bewertung",
    statsHeading: "Pipeline-Kennzahlen",
    statsConversion: "Conversion",
    statsMedian: "Median der Tage in der Stufe",
    statsRoles: "Bewerbungen nach Rolle",
    statsReached: (count) => (count === 1 ? "1 erreicht" : `${count} erreicht`),
    statsConversionOf: (pct) => `${pct}% der vorherigen Stufe`,
    statsMedianDays: (days) => (days === 1 ? "1 Tag" : `${days} Tage`),
    statsNoMedian: "Noch keine Werte",
    statsTotal: (count) => (count === 1 ? "1 Bewerbung insgesamt" : `${count} Bewerbungen insgesamt`),
  },
};
