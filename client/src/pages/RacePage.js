import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Canvas from "../components/Canvas/Canvas";
import Leaderboard from "../components/Leaderboard/Leaderboard";
import { getRaceData, getDrivers } from "../services/api";
import "./RacePage.css";

function RacePage() {
  const [trackImage, setTrackImage] = useState(null);
  const [race, setRace] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // 🔥 FETCH RACE DATA + POLLING (FIXED)
  useEffect(() => {
    let interval = null;

    const fetchData = async () => {
      try {
        const data = await getRaceData();
        if (!data) return;

        setRace(data.race);
        setIsLive(data.isLive);
        setTrackImage(data.trackImage || null);

        if (Array.isArray(data.cars)) {
          setCars(data.cars);
        }

        // ✅ start polling only once
        if (data.isLive && !interval) {
          interval = setInterval(fetchData, 3000);
        }

      } catch (err) {
        console.log("Race fetch error:", err);
      }
    };

    fetchData();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // 🔥 FETCH DRIVERS
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        if (Array.isArray(data)) {
          setDrivers(data);
        }
      } catch (err) {
        console.log("Drivers fetch error:", err);
      }
    };

    fetchDrivers();
  }, []);

  const raceDate = race?.date_start
    ? new Date(race.date_start).toLocaleString()
    : "TBD";

  return (
    <div className="race-page">
      <Navbar />

      {isLive ? (
        <div className="race-layout">
          
          <div className="left">
            <Leaderboard
              cars={cars}
              drivers={drivers}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </div>

          <div className="center">
            <Canvas
              cars={cars}
              drivers={drivers}
              trackImage={trackImage}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </div>

          <div className="right">
            <h2>LIVE 🔴</h2>
            <p>
              {race?.location} - {race?.country_name}
            </p>
          </div>

        </div>
      ) : (
        <div className="race-details">
          
          <h2>UPCOMING RACE</h2>
          <p>
            {race?.location} - {race?.country_name}
          </p>
          <p>{raceDate}</p>

          <div className="track-box">
            <Canvas cars={[]} trackImage={trackImage} />

            <div className="no-live-overlay">
              No Live Race Data
            </div>
          </div>

          <div className="drivers-box">
            <p>Drivers will be available during live race</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default RacePage;