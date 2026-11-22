# Learning notes

Short explanations of the ideas this project actually uses, and why they matter. Each one points at a file.

## Drag and drop is not enough on its own

Native HTML5 drag and drop moves a card between columns, but it is a pointer gesture. A keyboard or screen-reader user never gets a `drop` event. So every card also has a labelled `<select>` that calls the same `moveApplicant` function. The drag path and the select path share one rule set: rejected needs a reason, hired cannot be moved, and an already-current stage is a no-op.

The drag payload is only the applicant id (`application/x-applicant-id`). The board does not trust a blob of applicant JSON from the pointer. When the drop would reject someone, the UI opens the reason dialog instead of moving first and asking later.

See `src/lib/dnd.ts`, `src/components/ApplicantCard.tsx`, `src/components/Column.tsx`, `src/domain/moves.ts` and `src/test/moves.ui.test.tsx`.

## Zod sits at the boundary, not in the middle of the UI

The hiring rules are ordinary TypeScript functions. Zod is reserved for data that crosses a boundary: the seed applicants, anything read back from `localStorage`, and the theme, motion and locale preferences. If the stored board is missing, truncated or the wrong shape, the app falls back to a fresh seed instead of crashing mid-render. The same idea applies to a preference that has an unknown value: it is ignored and a safe default is used (Graphite, static, English).

Keeping the parse at the edge means the React tree can treat an `Applicant` as already valid. Tests cover both the happy parse and the corrupt-storage path.

See `src/domain/schemas.ts`, `src/lib/storage.ts` and `src/test/storage.test.ts`.

## Filters belong in the URL

Search, role, rating and sort are not only React state. They are written to the query string with `history.replaceState`, and they are read back when the page loads. A view can be bookmarked or sent to someone else, and a refresh does not reset the filters. Unknown or empty params fall back to the defaults, so a hand-edited URL cannot break the board.

The filter helpers are pure (`parseFilters`, `serializeFilters`, `matchesFilters`, `sortApplicants`). The toolbar only renders them. That keeps the shareable URL honest and easy to test without mounting the whole app.

See `src/lib/filters.ts`, `src/components/Toolbar.tsx` and `src/test/filters.test.ts`.
