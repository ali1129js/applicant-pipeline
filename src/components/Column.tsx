import type { Applicant, Stage } from "../domain/schemas";
import type { UIStrings } from "../lib/i18n";
import { ApplicantCard } from "./ApplicantCard";

interface Props {
  stage: Stage;
  applicants: readonly Applicant[];
  now: Date;
  strings: UIStrings;
}

export function Column({ stage, applicants, now, strings }: Props) {
  const headingId = `stage-${stage}`;
  const label = strings.stageLabel[stage];
  return (
    <section className="board-column" data-stage={stage} aria-labelledby={headingId}>
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
              <ApplicantCard applicant={applicant} now={now} strings={strings} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
