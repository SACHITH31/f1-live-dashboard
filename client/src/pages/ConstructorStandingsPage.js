import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ConstructorStandingsTable from "../components/ConstructorStandingsTable/ConstructorStandingsTable";
import { getConstructorStandings } from "../services/api";
import "./ConstructorStandingsPage.css";

function ConstructorStandingsSkeleton() {
  return (
    <div className="constructor-standings-skeleton" aria-label="Loading constructor standings">
      <div className="constructor-standings-skeleton-line" />
      <div className="constructor-standings-spinner" aria-hidden="true" />
      <div className="constructor-standings-skeleton-card" />
    </div>
  );
}

function ConstructorStandingsPage() {
  const [standings, setStandings] = useState([]);
  const [season, setSeason] = useState("current");
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStandings = async () => {
      setLoading(true);
      const data = await getConstructorStandings("current");

      if (!isMounted) return;

      setStandings(Array.isArray(data?.standings) ? data.standings : []);
      setSeason(data?.season || data?.year || "current");
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
    <div className="constructor-standings-page">
      <Navbar />

      <main className="constructor-standings-shell">
        <section className="constructor-standings-header">
          <div>
            <p className="section-label">Championship</p>
            <h1>Constructor Standings</h1>
            <p>
              {season === "current" ? "Current season" : season}
              {round ? ` - Round ${round}` : ""}
            </p>
          </div>
        </section>

        {loading ? (
          <ConstructorStandingsSkeleton />
        ) : message ? (
          <p className="constructor-standings-message">{message}</p>
        ) : (
          <ConstructorStandingsTable rows={standings} />
        )}
      </main>
    </div>
  );
}

export default ConstructorStandingsPage;
