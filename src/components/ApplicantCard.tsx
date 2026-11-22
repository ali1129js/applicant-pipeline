import { daysInStage } from "../domain/moves";
import { STAGES, type Applicant, type Stage } from "../domain/schemas";
import { APPLICANT_DRAG_TYPE } from "../lib/dnd";
import type { UIStrings } from "../lib/i18n";

interface Props {
  applicant: Applicant;
  now: Date;
  strings: UIStrings;
  onMove: (id: string, to: Stage) => void;
}

export function ApplicantCard({ applicant, now, strings, onMove }: Props) {
  const days = daysInStage(applicant, now);
  const moveLabel = strings.moveTo(applicant.name);
  return (
    <article
      className="applicant-card"
      data-stage={applicant.stage}
      data-id={applicant.id}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(APPLICANT_DRAG_TYPE, applicant.id);
        event.dataTransfer.effectAllowed = "move";
      }}
    >
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
      <label className="move-field">
        <span className="sr-only">{moveLabel}</span>
        <select
          aria-label={moveLabel}
          value={applicant.stage}
          onChange={(event) => onMove(applicant.id, event.target.value as Stage)}
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {strings.stageLabel[stage]}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}
