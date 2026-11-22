import { z } from "zod";
import {
  DEFAULT_LOCALE,
  DEFAULT_MOTION,
  DEFAULT_THEME,
  LOCALE_NAMES,
  MOTION_NAMES,
  THEME_NAMES,
} from "./types";
import { applicantSchema, type Applicant } from "../domain/schemas";
import type { LocaleName, MotionName, ThemeName } from "./types";

export const KEYS = {
  theme: "applicant-pipeline.v1.theme",
  motion: "applicant-pipeline.v1.motion",
  locale: "applicant-pipeline.v1.locale",
  board: "applicant-pipeline.v1.board",
} as const;

export const themeSchema = z.enum(THEME_NAMES);
export const motionSchema = z.enum(MOTION_NAMES);
export const localeSchema = z.enum(LOCALE_NAMES);
export const applicantsSchema = z.array(applicantSchema);

/** Reads and validates a value. Missing, corrupt or wrong-shaped data gives the fallback. */
export function readStored<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

/** Storage can be full or blocked; the app still works, it just forgets. */
export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function defaultTheme(): ThemeName {
  return DEFAULT_THEME;
}

export function defaultMotion(): MotionName {
  return DEFAULT_MOTION;
}

export function defaultLocale(): LocaleName {
  return DEFAULT_LOCALE;
}

export function readBoard(fallback: () => Applicant[]): Applicant[] {
  try {
    const raw = localStorage.getItem(KEYS.board);
    if (raw === null) return fallback();
    const parsed = applicantsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback();
  } catch {
    return fallback();
  }
}

export function writeBoard(applicants: readonly Applicant[]): void {
  writeStored(KEYS.board, applicants);
}
