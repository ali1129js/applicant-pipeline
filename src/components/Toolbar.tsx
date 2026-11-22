import { ROLE_IDS } from "../domain/schemas";
import type { BoardFilters, SortKey } from "../lib/filters";
import type { UIStrings } from "../lib/i18n";

interface Props {
  filters: BoardFilters;
  onChange: (filters: BoardFilters) => void;
  strings: UIStrings;
}

export function Toolbar({ filters, onChange, strings }: Props) {
  return (
    <div className="toolbar" role="search">
      <label className="toolbar-field toolbar-search">
        <span>{strings.search}</span>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder={strings.searchPlaceholder}
        />
      </label>
      <label className="toolbar-field">
        <span>{strings.filterRole}</span>
        <select
          value={filters.roleId}
          onChange={(event) =>
            onChange({
              ...filters,
              roleId:
                event.target.value === "all"
                  ? "all"
                  : (event.target.value as BoardFilters["roleId"]),
            })
          }
        >
          <option value="all">{strings.filterAll}</option>
          {ROLE_IDS.map((id) => (
            <option key={id} value={id}>
              {strings.roleLabel[id]}
            </option>
          ))}
        </select>
      </label>
      <label className="toolbar-field">
        <span>{strings.filterRating}</span>
        <select
          value={filters.rating === "all" ? "all" : String(filters.rating)}
          onChange={(event) =>
            onChange({
              ...filters,
              rating:
                event.target.value === "all"
                  ? "all"
                  : (Number(event.target.value) as 1 | 2 | 3 | 4 | 5),
            })
          }
        >
          <option value="all">{strings.filterAll}</option>
          {([1, 2, 3, 4, 5] as const).map((value) => (
            <option key={value} value={value}>
              {strings.rating(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="toolbar-field">
        <span>{strings.sortBy}</span>
        <select
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
        >
          <option value="name">{strings.sortName}</option>
          <option value="rating">{strings.sortRating}</option>
          <option value="days">{strings.sortDays}</option>
        </select>
      </label>
    </div>
  );
}
