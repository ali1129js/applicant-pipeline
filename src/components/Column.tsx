import type { DragEvent } from "react";
import type { Applicant, Stage } from "../domain/schemas";
import { APPLICANT_DRAG_TYPE } from "../lib/dnd";
import type { UIStrings } from "../lib/i18n";
import { ApplicantCard } from "./ApplicantCard";

interface Props {
  stage: Stage;
  applicants: readonly Applicant[];
  now: Date;
  strings: UIStrings;
  onMove: (id: string, to: Stage) => void;
  onOpen: (id: string) => void;
}

export function Column({ stage, applicants, now, strings, onMove, onOpen }: Props) {
  const headingId = `stage-${stage}`;
  const label = strings.stageLabel[stage];

  function acceptDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  return (
    <section
      className="board-column"
      data-stage={stage}
      aria-labelledby={headingId}
      onDragOver={acceptDrop}
      onDragEnter={acceptDrop}
      onDrop={(event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData(APPLICANT_DRAG_TYPE);
        if (id) onMove(id, stage);
      }}
    >
      <header className="column-header">
        <h3 id={headingId}>
          {label} <span className="column-count">({applicants.length})</span>
        </h3>
      </header>
      {applicants.length === 0 ? (
        <p className="column-empty">{strings.emptyColumn}</p>
      ) : (
        <ul className="column-cards">
          {applicants.map((applicant) => (
            <li key={applicant.id}>
              <ApplicantCard
                applicant={applicant}
                now={now}
                strings={strings}
                onMove={onMove}
                onOpen={onOpen}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
