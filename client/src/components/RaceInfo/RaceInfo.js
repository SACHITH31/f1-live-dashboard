import { useEffect, useState } from "react";
import "./RaceInfo.css";

function RaceInfo({ race, isLive }) {
  const [timeLeft, setTimeLeft] = useState("");

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
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [race, isLive]);

  if (!race && !isLive) {
    return <div className="race-info">No race data available</div>;
  }

  return (
    <div className="race-info">
      {isLive ? (
        <>
          <h2>LIVE NOW</h2>
          <p>
            {race?.location || "Live session"}{" "}
            {race?.country_name ? `- ${race.country_name}` : ""}
          </p>
        </>
      ) : (
        <>
          <h2>UPCOMING RACE</h2>

          <p>
            {race.location} - {race.country_name}
          </p>

          <p>{new Date(race.date_start).toLocaleString()}</p>

          <h3 className="countdown">{timeLeft}</h3>
        </>
      )}
    </div>
  );
}

export default RaceInfo;
