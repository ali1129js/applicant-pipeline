import { describe, expect, it } from "vitest";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "../lib/demo";
import {
  KEYS,
  applicantsSchema,
  readBoard,
  readStored,
  themeSchema,
  writeBoard,
} from "../lib/storage";
import { DEFAULT_THEME } from "../lib/types";

describe("readStored", () => {
  it("returns the fallback when the key is missing", () => {
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
  });

  it("returns the fallback for corrupt JSON or an unknown theme", () => {
    localStorage.setItem(KEYS.theme, "{");
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
    localStorage.setItem(KEYS.theme, JSON.stringify("navy"));
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
  });

  it("returns a valid stored theme", () => {
    localStorage.setItem(KEYS.theme, JSON.stringify("khaki"));
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("khaki");
  });
});

describe("board persistence", () => {
  const seed = () => generateApplicants({ referenceDate: DEMO_TODAY });

  it("round-trips a valid board", () => {
    const board = seed();
    writeBoard(board);
    expect(readBoard(() => [])).toEqual(board);
    expect(applicantsSchema.safeParse(board).success).toBe(true);
  });

  it("falls back to seed data when the stored value is corrupt", () => {
    const fallback = seed();
    localStorage.setItem(KEYS.board, "{");
    expect(readBoard(() => fallback)).toEqual(fallback);
    localStorage.setItem(KEYS.board, JSON.stringify([{ id: "bad" }]));
    expect(readBoard(() => fallback)).toEqual(fallback);
  });
});
