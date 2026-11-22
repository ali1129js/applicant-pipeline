import { STAGES, type Applicant } from "../domain/schemas";
import { applicantsInStage } from "../domain/moves";
import type { UIStrings } from "../lib/i18n";
import { Column } from "./Column";

interface Props {
  applicants: readonly Applicant[];
  now: Date;
  strings: UIStrings;
}

export function Board({ applicants, now, strings }: Props) {
  return (
    <div className="board" data-testid="board" role="region" aria-label={strings.boardHeading}>
      {STAGES.map((stage) => (
        <Column
          key={stage}
          stage={stage}
          applicants={applicantsInStage(applicants, stage)}
          now={now}
          strings={strings}
        />
      ))}
    </div>
  );
}
