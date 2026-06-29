import { useMemo, useState } from "react";
import teamLogos from "../../services/teamLogos";
import "./ConstructorStandingsTable.css";

const displayValue = (value) => value ?? "TBD";

const filters = [
  { label: "All Teams", value: "all", limit: null },
  { label: "Top 5", value: "top5", limit: 5 },
  { label: "Top 10", value: "top10", limit: 10 },
];

const sortableColumns = [
  { key: "position", label: "Position", type: "number" },
  { key: "teamName", label: "Constructor", type: "text" },
  { key: "points", label: "Points", type: "number" },
  { key: "wins", label: "Wins", type: "number" },
  { key: "gapToLeader", label: "Gap To Leader", type: "number" },
];

const getLogo = (teamName) => teamLogos[teamName] || null;

const getSortValue = (row, column) => {
  const value = row[column.key];
  if (value === null || value === undefined) return null;
  return column.type === "number" ? Number(value) : String(value).toLowerCase();
};

const compareRows = (a, b, sortConfig) => {
  const column = sortableColumns.find((item) => item.key === sortConfig.key);
  const aValue = getSortValue(a, column);
  const bValue = getSortValue(b, column);

  if (aValue === null && bValue === null) return 0;
  if (aValue === null) return 1;
  if (bValue === null) return -1;

  if (column.type === "number") {
    return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
  }

  return sortConfig.direction === "asc"
    ? String(aValue).localeCompare(String(bValue))
    : String(bValue).localeCompare(String(aValue));
};

function ConstructorLogo({ teamName }) {
  const logo = getLogo(teamName);

  if (!logo) {
    return <span className="constructor-logo-fallback" aria-hidden="true" />;
  }

  return <img className="constructor-logo" src={logo} alt={`${teamName} logo`} />;
}

function ConstructorStandingsTable({ rows = [] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "position",
    direction: "asc",
  });

  const normalizedRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedFilter = filters.find((item) => item.value === filter) || filters[0];

    return normalizedRows
      .filter((row) => {
        if (!normalizedQuery) return true;
        return row.teamName?.toLowerCase().includes(normalizedQuery);
      })
      .filter((row) => {
        if (!selectedFilter.limit) return true;
        return row.position !== null && row.position <= selectedFilter.limit;
      })
      .sort((a, b) => compareRows(a, b, sortConfig));
  }, [normalizedRows, query, filter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (normalizedRows.length === 0) {
    return (
      <section className="constructor-standings-panel">
        <h2>Standings</h2>
        <p className="constructor-standings-empty">Constructor standings unavailable.</p>
      </section>
    );
  }

  return (
    <section className="constructor-standings-panel">
      <div className="constructor-standings-toolbar">
        <label className="constructor-standings-search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Constructor name"
            type="search"
          />
        </label>

        <div className="constructor-standings-filters" aria-label="Constructor standings filters">
          {filters.map((item) => (
            <button
              className={filter === item.value ? "active" : ""}
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="constructor-standings-summary">
        {filteredRows.length} team{filteredRows.length === 1 ? "" : "s"}
      </div>

      {filteredRows.length === 0 ? (
        <p className="constructor-standings-empty">
          No constructor standings match this view.
        </p>
      ) : (
        <>
          <div className="constructor-standings-table-wrap">
            <table className="constructor-standings-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  {sortableColumns.map((column) => (
                    <th key={column.key}>
                      <button onClick={() => handleSort(column.key)} type="button">
                        {column.label}
                        {sortConfig.key === column.key && (
                          <span>{sortConfig.direction === "asc" ? "Asc" : "Desc"}</span>
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.teamId || row.teamName}>
                    <td>
                      <ConstructorLogo teamName={row.teamName} />
                    </td>
                    <td>{displayValue(row.position)}</td>
                    <td>
                      <strong>{displayValue(row.teamName)}</strong>
                    </td>
                    <td>{displayValue(row.points)}</td>
                    <td>{displayValue(row.wins)}</td>
                    <td>{displayValue(row.gapToLeader)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="constructor-standings-cards">
            {filteredRows.map((row) => (
              <article
                className="constructor-standing-card"
                key={`card-${row.teamId || row.teamName}`}
              >
                <div className="constructor-standing-card-head">
                  <ConstructorLogo teamName={row.teamName} />
                  <div>
                    <span>P{displayValue(row.position)}</span>
                    <strong>{displayValue(row.teamName)}</strong>
                  </div>
                </div>
                <div className="constructor-standing-card-grid">
                  <span>Points</span>
                  <strong>{displayValue(row.points)}</strong>
                  <span>Wins</span>
                  <strong>{displayValue(row.wins)}</strong>
                  <span>Gap</span>
                  <strong>{displayValue(row.gapToLeader)}</strong>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ConstructorStandingsTable;
