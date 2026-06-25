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
  const [details, setDetails] = useState(null);
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
      setDetails(data?.details || null);
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

            <section className="race-data-grid">
              <div className="race-data-panel classification-panel">
                <h2>Final Classification</h2>
                {details?.finalClassification?.length > 0 ? (
                  <div className="classification-list">
                    {details.finalClassification.map((driver) => (
                      <div className="classification-row" key={driver.driverNumber}>
                        <span>{driver.position}</span>
                        <strong>{driver.nameAcronym}</strong>
                        <p>{driver.fullName}</p>
                        <em>
                          {driver.teamName}
                          {driver.source === "lap-summary" ? " · lap order" : ""}
                        </em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-empty">Classification data unavailable.</p>
                )}
              </div>

              <div className="race-data-panel">
                <h2>Fastest Laps</h2>
                {details?.fastestLaps?.length > 0 ? (
                  <div className="compact-list">
                    {details.fastestLaps.map((lap) => (
                      <div className="compact-row" key={lap.driverNumber}>
                        <div>
                          <strong>{lap.fullName}</strong>
                          <span>{lap.teamName}</span>
                        </div>
                        <em>{lap.bestLapText || "TBD"}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-empty">Lap data unavailable.</p>
                )}
              </div>

              <div className="race-data-panel">
                <h2>Pit Stops</h2>
                {details?.pitSummary?.length > 0 ? (
                  <div className="compact-list">
                    {details.pitSummary.map((pit) => (
                      <div className="compact-row" key={pit.driverNumber}>
                        <div>
                          <strong>{pit.fullName}</strong>
                          <span>{pit.teamName}</span>
                        </div>
                        <em>
                          {pit.stops} stop{pit.stops === 1 ? "" : "s"} | {pit.totalDurationText}
                        </em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-empty">Pit stop data unavailable.</p>
                )}
              </div>

              <div className="race-data-panel">
                <h2>Tyre Compounds</h2>
                {details?.stintSummary?.length > 0 ? (
                  <div className="compact-list">
                    {details.stintSummary.map((stint) => (
                      <div className="compact-row" key={stint.driverNumber}>
                        <div>
                          <strong>{stint.fullName}</strong>
                          <span>{stint.teamName}</span>
                        </div>
                        <em>{stint.compounds.join(", ") || "TBD"}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-empty">Tyre data unavailable.</p>
                )}
              </div>

              <div className="race-data-panel">
                <h2>Weather</h2>
                {details?.weatherSummary ? (
                  <div className="weather-grid">
                    <div>
                      <span>Air</span>
                      <strong>{details.weatherSummary.airTemperature ?? "TBD"} C</strong>
                    </div>
                    <div>
                      <span>Track</span>
                      <strong>{details.weatherSummary.trackTemperature ?? "TBD"} C</strong>
                    </div>
                    <div>
                      <span>Humidity</span>
                      <strong>{details.weatherSummary.humidity ?? "TBD"}%</strong>
                    </div>
                    <div>
                      <span>Rainfall</span>
                      <strong>{details.weatherSummary.rainfall ?? "TBD"}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="panel-empty">Weather data unavailable.</p>
                )}
              </div>

              <div className="race-data-panel race-control-panel">
                <h2>Race Control</h2>
                {details?.raceControlMessages?.length > 0 ? (
                  <div className="message-list">
                    {details.raceControlMessages.map((item, index) => (
                      <div className="message-row" key={`${item.date}-${index}`}>
                        <strong>{item.category || item.flag || "Message"}</strong>
                        <p>{item.message}</p>
                        <span>{item.lapNumber ? `Lap ${item.lapNumber}` : "Session"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="panel-empty">Race control messages unavailable.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default CalendarRacePage;
