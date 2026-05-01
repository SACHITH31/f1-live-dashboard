import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { getRaceData } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [race, setRace] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const data = await getRaceData();

      if (!isMounted) return;

      if (!data) {
        setError("Unable to load race data right now.");
        setLoading(false);
        return;
      }

      setError(data.message || "");
      setIsLive(Boolean(data.isLive));
      setRace(data.race || null);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!race || isLive) return;

    const updateCountdown = () => {
      const now = new Date();
      const raceTime = new Date(race.date_start);
      const diff = raceTime - now;

      if (diff <= 0) {
        setTimeLeft("Starting soon...");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${h}h ${m}m ${s}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [race, isLive]);

  const raceLocation = race?.location || "Location TBD";
  const raceCountry = race?.country_name ? ` - ${race.country_name}` : "";

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-container">
        {loading ? (
          <p className="no-data">Loading race data...</p>
        ) : error ? (
          <p className="no-data">{error}</p>
        ) : isLive ? (
          <div className="race-card live" onClick={() => navigate("/race")}>
            <h2>LIVE NOW</h2>
            <p>
              {raceLocation}
              {raceCountry}
            </p>
            <button type="button">Go to Live Race</button>
          </div>
        ) : race ? (
          <div className="race-card" onClick={() => navigate("/race")}>
            <h2>UPCOMING RACE</h2>
            <p>
              {raceLocation}
              {raceCountry}
            </p>
            <p>{new Date(race.date_start).toLocaleString()}</p>
            <h3>{timeLeft}</h3>
            <button type="button">View Race Details</button>
          </div>
        ) : (
          <p className="no-data">No race data available</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
