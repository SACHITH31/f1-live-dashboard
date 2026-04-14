import "./Leaderboard.css";
import teamLogos from "../../services/teamLogos";

function Leaderboard({ cars, drivers, selectedDriver, setSelectedDriver }) {

  // 🧠 Merge car + driver data
  const merged = cars.map((car, index) => {
    const driverInfo = drivers.find(
      (d) => d.driver_number === car.driver
    );

    return {
      position: index + 1,
      driver: car.driver,
      name: driverInfo?.full_name || "Unknown",
      team: driverInfo?.team_name || "Unknown",
      color: `#${driverInfo?.team_colour}` || "#e10600",
      logo: teamLogos[driverInfo?.team_name] || null,
    };
  });

  return (
    <div className="leaderboard">
      <h2>🏁 Leaderboard</h2>

      {merged.map((d) => (
        <div
          key={d.driver}
          className={`driver-row ${
            selectedDriver === d.driver ? "active" : ""
          }`}
          onClick={() => setSelectedDriver(d.driver)}
        >
          {/* POSITION */}
          <div className="pos">{d.position}</div>

          {/* COLOR BAR */}
          <div
            className="color-bar"
            style={{ background: d.color }}
          />

          {/* LOGO */}
          {d.logo && (
            <img className="team-logo" src={d.logo} alt="logo" />
          )}

          {/* DRIVER INFO */}
          <div className="info">
            <span className="name">{d.name}</span>
            <span className="team">{d.team}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;