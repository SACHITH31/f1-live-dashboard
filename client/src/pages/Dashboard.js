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
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await getRaceData();
        // console.log(data);

        if (isMounted && data) {
          setIsLive(data.isLive);
          if (data.race !== null) {
            setRace(data.race);
          }
        }
      } catch (err) {
        console.log("Fetch error:", err);
      }

      if (isMounted) setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);
  // console.log(loading);
  useEffect(() => {
    if (!race || isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const raceTime = new Date(race.date_start);
      const diff = raceTime - now;

      if (diff <= 0) {
        setTimeLeft("Starting soon...");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [race, isLive]);

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-container">
        {loading ? (
          <p className="no-data">Loading race data...</p>
        ) : isLive ? (
          <div className="race-card live" onClick={() => navigate("/race")}>
            <h2>LIVE NOW 🔴</h2>
            <p>
              {race?.location} - {race?.country_name}
            </p>
            <button>Go to Live Race →</button>
          </div>
        ) : race ? (
          <div className="race-card" onClick={() => navigate("/race")}>
            <h2>UPCOMING RACE</h2>
            <p>
              {race.location} - {race.country_name}
            </p>
            <p>{new Date(race.date_start).toLocaleString()}</p>
            <h3>{timeLeft}</h3>
            <button>View Race Details →</button>
          </div>
        ) : (
          <p className="no-data">No race data available</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
