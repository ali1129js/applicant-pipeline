import { STAGES, type Applicant, type Stage } from "../domain/schemas";
import { visibleInStage, type BoardFilters } from "../lib/filters";
import type { UIStrings } from "../lib/i18n";
import { Column } from "./Column";

interface Props {
  applicants: readonly Applicant[];
  now: Date;
  strings: UIStrings;
  filters: BoardFilters;
  onMove: (id: string, to: Stage) => void;
  onOpen: (id: string) => void;
}

export function Board({ applicants, now, strings, filters, onMove, onOpen }: Props) {
  return (
    <div className="board" data-testid="board" role="region" aria-label={strings.boardHeading}>
      {STAGES.map((stage) => (
        <Column
          key={stage}
          stage={stage}
          applicants={visibleInStage(applicants, stage, filters, now)}
          now={now}
          strings={strings}
          onMove={onMove}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
