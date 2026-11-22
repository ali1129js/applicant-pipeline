import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "../lib/demo";
import { STRINGS } from "../lib/i18n";

const seed = generateApplicants({ referenceDate: DEMO_TODAY });
const sample = seed.find((row) => row.notes.length === 0) ?? seed[0];
if (!sample) throw new Error("empty seed");

describe("applicant detail drawer", () => {
  it("opens from the view button, traps focus, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const openButton = screen.getByRole("button", { name: STRINGS.en.viewProfile(sample.name) });
    await user.click(openButton);
    const drawer = screen.getByRole("dialog", { name: sample.name });
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText(sample.email)).toBeInTheDocument();
    expect(within(drawer).getByText(STRINGS.en.timelineHeading)).toBeInTheDocument();
    expect(document.activeElement).toBeTruthy();
    expect(drawer.contains(document.activeElement)).toBe(true);
    await user.tab({ shift: true });
    expect(drawer.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: sample.name })).not.toBeInTheDocument();
  });

  it("adds and deletes a note and updates the rating", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    await user.click(screen.getByRole("button", { name: STRINGS.en.viewProfile(sample.name) }));
    const drawer = screen.getByRole("dialog", { name: sample.name });
    await user.type(
      within(drawer).getByLabelText(STRINGS.en.notePlaceholder),
      "Follow up next week.",
    );
    await user.click(within(drawer).getByRole("button", { name: STRINGS.en.addNote }));
    expect(within(drawer).getByText("Follow up next week.")).toBeInTheDocument();
    await user.selectOptions(
      within(drawer).getByRole("combobox", { name: STRINGS.en.ratingLabel }),
      "5",
    );
    expect(within(drawer).getByRole("combobox", { name: STRINGS.en.ratingLabel })).toHaveValue("5");
    await user.click(within(drawer).getByRole("button", { name: STRINGS.en.deleteNote }));
    expect(within(drawer).getByText(STRINGS.en.notesEmpty)).toBeInTheDocument();
  });
});
