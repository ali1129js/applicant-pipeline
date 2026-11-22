import { pipelineStats } from "../domain/stats";
import type { Applicant } from "../domain/schemas";
import type { UIStrings } from "../lib/i18n";

interface Props {
  applicants: readonly Applicant[];
  now: Date;
  strings: UIStrings;
}

export function StatsStrip({ applicants, now, strings }: Props) {
  const stats = pipelineStats(applicants, now);
  return (
    <section className="stats-strip" aria-labelledby="stats-heading">
      <div className="stats-head">
        <h3 id="stats-heading">{strings.statsHeading}</h3>
        <p className="stats-total">{strings.statsTotal(stats.total)}</p>
      </div>
      <div className="stats-groups">
        <div className="stats-group">
          <h4>{strings.statsConversion}</h4>
          <ol className="stats-list">
            {stats.conversions.map((row) => (
              <li key={row.stage}>
                <span className="stats-label">{strings.stageLabel[row.stage]}</span>
                <span>{strings.statsReached(row.reached)}</span>
                {row.conversionPct !== null && (
                  <span className="stats-muted">{strings.statsConversionOf(row.conversionPct)}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="stats-group">
          <h4>{strings.statsMedian}</h4>
          <ul className="stats-list">
            {stats.medians.map((row) => (
              <li key={row.stage}>
                <span className="stats-label">{strings.stageLabel[row.stage]}</span>
                <span>
                  {row.medianDays === null
                    ? strings.statsNoMedian
                    : strings.statsMedianDays(row.medianDays)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="stats-group">
          <h4>{strings.statsRoles}</h4>
          <ul className="stats-list">
            {stats.roles.map((row) => (
              <li key={row.roleId}>
                <span className="stats-label">{strings.roleLabel[row.roleId]}</span>
                <span>{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
