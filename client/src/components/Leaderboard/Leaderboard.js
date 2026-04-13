import "./Leaderboard.css";

function Leaderboard({ cars, drivers, selectedDriver, setSelectedDriver }) {
  // 🔥 Merge car + driver data
  const merged = cars
    .map((car) => {
      const driver = drivers.find((d) => d.driver_number == car.driver);
      return {
        ...car,
        name: driver?.full_name || `Driver ${car.driver}`,
        team: driver?.team_name || "Unknown",
        color: driver?.team_colour || "#e10600",
      };
    })
    .sort((a, b) => a.y - b.y); // 🔥 ranking logic

  return (
    <div className="leaderboard">
      <h2>DRIVERS</h2>

      {merged.length === 0 ? (
        <p className="no-data">No live data</p>
      ) : (
        merged.map((d, i) => (
          <div
            key={d.driver}
            className={`driver ${selectedDriver === d.driver ? "active" : ""}`}
            onClick={() => setSelectedDriver(d.driver)}
          >
            <span className="position">{i + 1}</span>

            <div className="color-bar" style={{ background: d.color }}></div>

            <div className="info">
              <p className="name">{d.name}</p>
              <p className="team">{d.team}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Leaderboard;
