import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "../lib/demo";
import { serializeFilters } from "../lib/filters";
import { STRINGS } from "../lib/i18n";

const seed = generateApplicants({ referenceDate: DEMO_TODAY });
const sample = seed[0];
if (!sample) throw new Error("empty seed");

describe("search, filters and URL", () => {
  it("filters the board by name and writes the query to the URL", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    await user.type(screen.getByRole("searchbox", { name: STRINGS.en.search }), sample.name);
    expect(screen.getByRole("heading", { name: sample.name })).toBeInTheDocument();
    const hidden = seed.find((row) => !row.name.includes(sample.name.split(" ")[0] ?? ""));
    if (hidden) {
      expect(screen.queryByRole("heading", { name: hidden.name })).not.toBeInTheDocument();
    }
    expect(window.location.search).toBe(
      serializeFilters({
        query: sample.name,
        roleId: "all",
        rating: "all",
        sort: "name",
      }),
    );
  });

  it("reads filters from the URL on load", () => {
    window.history.replaceState(null, "", `/?role=${sample.roleId}&sort=rating`);
    render(<App initialApplicants={seed} />);
    expect(screen.getByRole("combobox", { name: STRINGS.en.filterRole })).toHaveValue(
      sample.roleId,
    );
    for (const row of seed) {
      const card = screen.queryByRole("heading", { name: row.name });
      if (row.roleId === sample.roleId) expect(card).toBeInTheDocument();
      else expect(card).not.toBeInTheDocument();
    }
    const column = screen
      .getByTestId("board")
      .querySelector(`[data-stage="${sample.stage}"]`) as HTMLElement;
    const names = within(column)
      .getAllByRole("heading", { level: 4 })
      .map((node) => node.textContent);
    const expected = seed
      .filter((row) => row.stage === sample.stage && row.roleId === sample.roleId)
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
      .map((row) => row.name);
    expect(names).toEqual(expected);
  });
});
