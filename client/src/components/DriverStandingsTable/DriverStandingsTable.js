import { useMemo, useState } from "react";
import "./DriverStandingsTable.css";

const displayValue = (value) => value ?? "TBD";

const sortableColumns = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "driverName", label: "Driver", type: "text" },
  { key: "teamName", label: "Team", type: "text" },
  { key: "points", label: "Points", type: "number" },
  { key: "wins", label: "Wins", type: "number" },
  { key: "podiums", label: "Podiums", type: "number" },
];

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

function DriverStandingsTable({ rows = [] }) {
  const [query, setQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "points",
    direction: "desc",
  });

  const normalizedRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedRows
      .filter((row) => {
        if (!normalizedQuery) return true;
        return [row.driverName, row.teamName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => compareRows(a, b, sortConfig));
  }, [normalizedRows, query, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  if (normalizedRows.length === 0) {
    return (
      <section className="driver-standings-panel">
        <h2>Standings</h2>
        <p className="driver-standings-empty">Driver standings unavailable.</p>
      </section>
    );
  }

  return (
    <section className="driver-standings-panel">
      <div className="driver-standings-toolbar">
        <label className="driver-standings-search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Driver or team"
            type="search"
          />
        </label>

        <div className="driver-standings-summary">
          {filteredRows.length} driver{filteredRows.length === 1 ? "" : "s"}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="driver-standings-empty">No standings match your search.</p>
      ) : (
        <>
          <div className="driver-standings-table-wrap">
            <table className="driver-standings-table">
              <thead>
                <tr>
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
                  <tr key={row.driver?.driverId || row.driverName}>
                    <td>{displayValue(row.rank)}</td>
                    <td>
                      <strong>{displayValue(row.driverName)}</strong>
                    </td>
                    <td>{displayValue(row.teamName)}</td>
                    <td>{displayValue(row.points)}</td>
                    <td>{displayValue(row.wins)}</td>
                    <td>{displayValue(row.podiums)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="driver-standings-cards">
            {filteredRows.map((row) => (
              <article
                className="driver-standing-card"
                key={`card-${row.driver?.driverId || row.driverName}`}
              >
                <div className="driver-standing-card-head">
                  <span>{displayValue(row.rank)}</span>
                  <div>
                    <strong>{displayValue(row.driverName)}</strong>
                    <em>{displayValue(row.teamName)}</em>
                  </div>
                </div>
                <div className="driver-standing-card-grid">
                  <span>Points</span>
                  <strong>{displayValue(row.points)}</strong>
                  <span>Wins</span>
                  <strong>{displayValue(row.wins)}</strong>
                  <span>Podiums</span>
                  <strong>{displayValue(row.podiums)}</strong>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default DriverStandingsTable;
