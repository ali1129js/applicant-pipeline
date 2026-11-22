import { useId, useRef, useState } from "react";
import type { Applicant } from "../domain/schemas";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { LocaleName } from "../lib/types";
import type { UIStrings } from "../lib/i18n";

interface Props {
  applicant: Applicant;
  locale: LocaleName;
  strings: UIStrings;
  onClose: () => void;
  onAddNote: (body: string) => void;
  onDeleteNote: (noteId: string) => void;
  onSetRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
}

function formatDate(value: string, locale: LocaleName): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DetailDrawer({
  applicant,
  locale,
  strings,
  onClose,
  onAddNote,
  onDeleteNote,
  onSetRating,
}: Props) {
  const titleId = useId();
  const noteId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  useFocusTrap(panelRef, true, onClose);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="drawer-header">
          <h2 id={titleId}>{applicant.name}</h2>
          <button type="button" className="button" onClick={onClose}>
            {strings.closeDrawer}
          </button>
        </header>

        <section aria-labelledby="profile-h">
          <h3 id="profile-h">{strings.profileHeading}</h3>
          <p>
            <strong>{strings.emailLabel}:</strong> {applicant.email}
          </p>
          <p>
            <strong>{strings.roleLabel[applicant.roleId]}</strong>
          </p>
          <p>
            <strong>{strings.appliedLabel}:</strong> {formatDate(applicant.appliedAt, locale)}
          </p>
          <p>
            <strong>{strings.stageLabel[applicant.stage]}</strong>
          </p>
        </section>

        <section aria-labelledby="rating-h">
          <h3 id="rating-h">{strings.ratingLabel}</h3>
          <label>
            <span className="sr-only">{strings.ratingLabel}</span>
            <select
              value={applicant.rating}
              onChange={(event) => onSetRating(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
            >
              {([1, 2, 3, 4, 5] as const).map((value) => (
                <option key={value} value={value}>
                  {strings.rating(value)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section aria-labelledby="timeline-h">
          <h3 id="timeline-h">{strings.timelineHeading}</h3>
          <ol className="timeline">
            {applicant.history.map((event, index) => (
              <li key={`${event.stage}-${event.enteredAt}-${index}`}>
                <strong>{strings.stageLabel[event.stage]}</strong>
                <div>{strings.timelineEntered(formatDate(event.enteredAt, locale))}</div>
                {event.exitedAt ? (
                  <div>{strings.timelineExited(formatDate(event.exitedAt, locale))}</div>
                ) : null}
                {event.reason ? <div>{event.reason}</div> : null}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="notes-h">
          <h3 id="notes-h">{strings.notesHeading}</h3>
          {applicant.notes.length === 0 ? (
            <p>{strings.notesEmpty}</p>
          ) : (
            <ul className="note-list">
              {applicant.notes.map((item) => (
                <li key={item.id}>
                  <p>{item.body}</p>
                  <p className="note-date">{formatDate(item.createdAt, locale)}</p>
                  <button type="button" className="button" onClick={() => onDeleteNote(item.id)}>
                    {strings.deleteNote}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="note-form"
            onSubmit={(event) => {
              event.preventDefault();
              const body = note.trim();
              if (!body) return;
              onAddNote(body);
              setNote("");
            }}
          >
            <label htmlFor={noteId}>{strings.notePlaceholder}</label>
            <textarea id={noteId} value={note} onChange={(event) => setNote(event.target.value)} />
            <button type="submit" className="button">
              {strings.addNote}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
