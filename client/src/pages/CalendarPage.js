import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { getCalendar } from "../services/api";
import "./CalendarPage.css";

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];
const filters = ["all", "upcoming", "completed"];

function CalendarPage() {
  const [year, setYear] = useState(currentYear);
  const [filter, setFilter] = useState("all");
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCalendar = async () => {
      setLoading(true);
      const data = await getCalendar(year);

      if (!isMounted) return;

      setRaces(Array.isArray(data?.races) ? data.races : []);
      setMessage(data?.message || "");
      setLoading(false);
    };

    fetchCalendar();

    return () => {
      isMounted = false;
    };
  }, [year]);

  const filteredRaces = useMemo(() => {
    if (filter === "all") return races;
    return races.filter((race) => race.status === filter);
  }, [filter, races]);

  const nextRaceKey = useMemo(
    () => races.find((race) => race.status === "upcoming")?.sessionKey,
    [races],
  );

  return (
    <div className="calendar-page">
      <Navbar />

      <main className="calendar-shell">
        <div className="calendar-heading">
          <div>
            <p className="section-label">Season schedule</p>
            <h1>{year} Race Calendar</h1>
          </div>

          <label className="year-control">
            <span>Year</span>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="calendar-toolbar" aria-label="Calendar filters">
          {filters.map((option) => (
            <button
              key={option}
              className={filter === option ? "active" : ""}
              onClick={() => setFilter(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="calendar-message">Loading calendar...</p>
        ) : message ? (
          <p className="calendar-message">{message}</p>
        ) : filteredRaces.length === 0 ? (
          <p className="calendar-message">No races found for this filter.</p>
        ) : (
          <div className="calendar-list">
            {filteredRaces.map((race, index) => {
              const date = race.dateStart ? new Date(race.dateStart) : null;
              const isNext = race.sessionKey === nextRaceKey;

              return (
                <article className="calendar-race" key={race.sessionKey}>
                  <div className="round-number">{index + 1}</div>

                  <div className="race-main">
                    <div className="race-title-row">
                      <h2>{race.circuitShortName || race.location}</h2>
                      <span className={`race-status ${race.status}`}>
                        {isNext ? "next" : race.status}
                      </span>
                    </div>

                    <p>
                      {race.location || "Location TBD"}
                      {race.countryName ? `, ${race.countryName}` : ""}
                    </p>
                  </div>

                  <div className="race-date">
                    <strong>
                      {date
                        ? date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD"}
                    </strong>
                    <span>
                      {date
                        ? date.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Time TBD"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default CalendarPage;
