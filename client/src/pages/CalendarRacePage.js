import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { getRaceDetails } from "../services/api";
import "./CalendarRacePage.css";

function CalendarRacePage() {
  const { sessionKey } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [weekendSessions, setWeekendSessions] = useState([]);
  const [trackImage, setTrackImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      const data = await getRaceDetails(sessionKey);

      if (!isMounted) return;

      setRace(data?.race || null);
      setWeekendSessions(Array.isArray(data?.weekendSessions) ? data.weekendSessions : []);
      setTrackImage(data?.trackImage || null);
      setMessage(data?.message || "");
      setLoading(false);
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [sessionKey]);

  const raceDate = race?.dateStart ? new Date(race.dateStart) : null;

  return (
    <div className="calendar-race-page">
      <Navbar />

      <main className="race-detail-shell">
        <button className="back-button" onClick={() => navigate("/calendar")} type="button">
          Back to calendar
        </button>

        {loading ? (
          <p className="race-detail-message">Loading race details...</p>
        ) : message ? (
          <p className="race-detail-message">{message}</p>
        ) : (
          <>
            <section className="race-detail-header">
              <div>
                <p className="section-label">Race details</p>
                <h1>{race?.circuitShortName || race?.location || "Race"}</h1>
                <p>
                  {race?.location || "Location TBD"}
                  {race?.countryName ? `, ${race.countryName}` : ""}
                </p>
              </div>

              <div className="race-detail-date">
                <strong>
                  {raceDate
                    ? raceDate.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date TBD"}
                </strong>
                <span>
                  {raceDate
                    ? raceDate.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time TBD"}
                </span>
                <em>{race?.status || "unknown"}</em>
              </div>
            </section>

            <section className="race-detail-grid">
              <div className="track-map-panel">
                {trackImage ? (
                  <img src={trackImage} alt={`${race?.circuitShortName || "Circuit"} map`} />
                ) : (
                  <div className="map-placeholder">Map unavailable</div>
                )}
              </div>

              <div className="weekend-panel">
                <h2>Weekend Sessions</h2>
                <div className="session-list">
                  {weekendSessions.map((session) => {
                    const sessionDate = session.dateStart
                      ? new Date(session.dateStart)
                      : null;

                    return (
                      <div className="session-row" key={session.sessionKey}>
                        <div>
                          <strong>{session.sessionName}</strong>
                          <span>{session.sessionType}</span>
                        </div>
                        <span>
                          {sessionDate
                            ? sessionDate.toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "TBD"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default CalendarRacePage;
