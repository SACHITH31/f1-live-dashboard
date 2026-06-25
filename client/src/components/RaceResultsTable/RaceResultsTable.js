import { useMemo, useState } from "react";
import "./RaceResultsTable.css";

const displayValue = (value) => value ?? "TBD";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Classified", value: "classified" },
  { label: "Points", value: "points" },
  { label: "DNF", value: "dnf" },
];

const columns = [
  { key: "position", label: "Pos", type: "number" },
  { key: "driverName", label: "Driver", type: "text" },
  { key: "teamName", label: "Team", type: "text" },
  { key: "gridPosition", label: "Grid", type: "number" },
  { key: "finishPosition", label: "Finish", type: "number" },
  { key: "points", label: "Pts", type: "number" },
  { key: "status", label: "Status", type: "text" },
  { key: "gapToLeader", label: "Gap", type: "text" },
];

const getSortValue = (row, column) => {
  const value = row[column.key];
  if (value === null || value === undefined) return null;
  return column.type === "number" ? Number(value) : String(value).toLowerCase();
};

const compareRows = (a, b, sortConfig) => {
  const column = columns.find((item) => item.key === sortConfig.key);
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

const matchesFilter = (row, filter) => {
  if (filter === "points") return Number(row.points) > 0;
  if (filter === "dnf") return row.status && row.status !== "Finished";
  if (filter === "classified") {
    return row.finishPosition !== null && row.finishPosition !== undefined;
  }
  return true;
};

function RaceResultsTable({ rows = [] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "finishPosition",
    direction: "asc",
  });

  const normalizedRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedRows
      .filter((row) => matchesFilter(row, statusFilter))
      .filter((row) => {
        if (!normalizedQuery) return true;
        return [row.driverName, row.teamName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => compareRows(a, b, sortConfig));
  }, [normalizedRows, query, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (normalizedRows.length === 0) {
    return (
      <section className="race-results-panel">
        <h2>Race Results</h2>
        <p className="race-results-empty">Verified race results unavailable.</p>
      </section>
    );
  }

  return (
    <section className="race-results-panel">
      <div className="race-results-heading">
        <div>
          <p className="section-label">Verified classification</p>
          <h2>Race Results</h2>
        </div>
        <span>{filteredRows.length} drivers</span>
      </div>

      <div className="race-results-toolbar">
        <label className="race-results-search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Driver or team"
            type="search"
          />
        </label>

        <div className="race-results-filters" aria-label="Race result filters">
          {statusFilters.map((filter) => (
            <button
              className={statusFilter === filter.value ? "active" : ""}
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="race-results-empty">No race results match this view.</p>
      ) : (
        <>
          <div className="race-results-table-wrap">
            <table className="race-results-table">
              <thead>
                <tr>
                  {columns.map((column) => (
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
                  <tr key={`${row.finishPosition}-${row.driver?.driverId}`}>
                    <td>{displayValue(row.position)}</td>
                    <td>
                      <strong>{displayValue(row.driverName)}</strong>
                    </td>
                    <td>{displayValue(row.teamName)}</td>
                    <td>{displayValue(row.gridPosition)}</td>
                    <td>{displayValue(row.finishPosition)}</td>
                    <td>{displayValue(row.points)}</td>
                    <td>{displayValue(row.status)}</td>
                    <td>{displayValue(row.gapToLeader)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="race-results-cards">
            {filteredRows.map((row) => (
              <article
                className="race-result-card"
                key={`card-${row.finishPosition}-${row.driver?.driverId}`}
              >
                <div className="race-result-card-head">
                  <span>P{displayValue(row.position)}</span>
                  <div>
                    <strong>{displayValue(row.driverName)}</strong>
                    <em>{displayValue(row.teamName)}</em>
                  </div>
                </div>
                <div className="race-result-card-grid">
                  <span>Grid</span>
                  <strong>{displayValue(row.gridPosition)}</strong>
                  <span>Finish</span>
                  <strong>{displayValue(row.finishPosition)}</strong>
                  <span>Points</span>
                  <strong>{displayValue(row.points)}</strong>
                  <span>Status</span>
                  <strong>{displayValue(row.status)}</strong>
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

export default RaceResultsTable;
