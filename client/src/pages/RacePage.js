import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Canvas from "../components/Canvas/Canvas";
import Leaderboard from "../components/Leaderboard/Leaderboard";
import DriverPanel from "../components/DriverPanel/DriverPanel";
import { getRaceData, getDrivers, getLocations } from "../services/api";
import "./RacePage.css";

const tabs = ["track", "leaderboard", "details"];

function RacePage() {
  const [trackImage, setTrackImage] = useState(null);
  const [race, setRace] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeTab, setActiveTab] = useState("track");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setRace(data.race);
      setIsLive(Boolean(data.isLive));
      setTrackImage(data.trackImage || null);

      if (Array.isArray(data.cars)) {
        setCars(data.cars);
      }

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
    let isMounted = true;

    const fetchDrivers = async () => {
      const data = await getDrivers();

      if (isMounted && Array.isArray(data)) {
        setDrivers(data);
      }
    };

    fetchDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLive) return;

    let isMounted = true;

    const fetchLocations = async () => {
      const data = await getLocations();

      if (isMounted && Array.isArray(data) && data.length > 0) {
        setCars(data);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLive]);

  const raceDate = race?.date_start
    ? new Date(race.date_start).toLocaleString()
    : "TBD";

  if (loading) {
    return (
      <div className="race-page">
        <Navbar />
        <div className="race-details">
          <p className="muted-message">Loading race data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="race-page">
      <Navbar />

      {error ? (
        <div className="race-details">
          <h2>Race Data Unavailable</h2>
          <p className="muted-message">{error}</p>
        </div>
      ) : isLive ? (
        <>
          <div className="mobile-tabs" aria-label="Race view tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="race-layout">
          <div className={`left ${activeTab === "leaderboard" ? "tab-active" : ""}`}>
            <Leaderboard
              cars={cars}
              drivers={drivers}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </div>

          <div className={`center ${activeTab === "track" ? "tab-active" : ""}`}>
            <Canvas
              cars={cars}
              drivers={drivers}
              trackImage={trackImage}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </div>

          <div className={`right ${activeTab === "details" ? "tab-active" : ""}`}>
            <h2>LIVE NOW</h2>
            <p>
              {race?.location || "Live session"}{" "}
              {race?.country_name ? `- ${race.country_name}` : ""}
            </p>
            <p>{cars.length} cars tracking</p>
            <DriverPanel
              selectedDriver={selectedDriver}
              drivers={drivers}
              cars={cars}
              isLive={isLive}
              race={race}
            />
          </div>
          </div>
        </>
      ) : (
        <div className="race-details">
          <h2>UPCOMING RACE</h2>
          <p>
            {race?.location || "Location TBD"}{" "}
            {race?.country_name ? `- ${race.country_name}` : ""}
          </p>
          <p>{raceDate}</p>

          <div className="track-box">
            <Canvas cars={[]} trackImage={trackImage} />

            <div className="no-live-overlay">No Live Race Data</div>
          </div>

          <div className="drivers-box">
            <DriverPanel
              selectedDriver={selectedDriver}
              drivers={drivers}
              cars={cars}
              isLive={isLive}
              race={race}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RacePage;
