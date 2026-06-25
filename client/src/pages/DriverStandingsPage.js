import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import DriverStandingsTable from "../components/DriverStandingsTable/DriverStandingsTable";
import { getDriverStandings } from "../services/api";
import "./DriverStandingsPage.css";

function DriverStandingsSkeleton() {
  return (
    <div className="standings-skeleton" aria-label="Loading driver standings">
      <div className="standings-skeleton-line" />
      <div className="standings-skeleton-card" />
    </div>
  );
}

function DriverStandingsPage() {
  const [standings, setStandings] = useState([]);
  const [year, setYear] = useState("current");
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStandings = async () => {
      setLoading(true);
      const data = await getDriverStandings("current");

      if (!isMounted) return;

      setStandings(Array.isArray(data?.standings) ? data.standings : []);
      setYear(data?.year || "current");
      setRound(data?.round || null);
      setMessage(data?.message || "");
      setLoading(false);
    };

    fetchStandings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="driver-standings-page">
      <Navbar />

      <main className="driver-standings-shell">
        <section className="driver-standings-header">
          <div>
            <p className="section-label">Championship</p>
            <h1>Driver Standings</h1>
            <p>
              {year === "current" ? "Current season" : year}
              {round ? ` - Round ${round}` : ""}
            </p>
          </div>
        </section>

        {loading ? (
          <DriverStandingsSkeleton />
        ) : message ? (
          <p className="standings-message">{message}</p>
        ) : (
          <DriverStandingsTable rows={standings} />
        )}
      </main>
    </div>
  );
}

export default DriverStandingsPage;
