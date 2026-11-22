import { daysInStage } from "../domain/moves";
import type { Applicant } from "../domain/schemas";
import type { UIStrings } from "../lib/i18n";

interface Props {
  applicant: Applicant;
  now: Date;
  strings: UIStrings;
}

export function ApplicantCard({ applicant, now, strings }: Props) {
  const days = daysInStage(applicant, now);
  return (
    <article className="applicant-card" data-stage={applicant.stage} data-id={applicant.id}>
      <h4 className="applicant-name">{applicant.name}</h4>
      <p className="applicant-role">{strings.roleLabel[applicant.roleId]}</p>
      <p className="applicant-meta">{strings.daysInStage(days)}</p>
      <p className="applicant-rating">
        <span aria-hidden="true">
          {"★".repeat(applicant.rating)}
          {"☆".repeat(5 - applicant.rating)}
        </span>
        <span className="sr-only">{strings.rating(applicant.rating)}</span>
      </p>
    </article>
  );
}
