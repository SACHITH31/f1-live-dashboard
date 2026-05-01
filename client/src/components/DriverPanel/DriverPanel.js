import "./DriverPanel.css";

function DriverPanel({ selectedDriver, drivers = [], cars = [], isLive, race }) {
  const driverInfo = drivers.find((driver) => driver.driver_number === selectedDriver);
  const car = cars.find((item) => item.driver === selectedDriver);

  if (!selectedDriver) {
    return (
      <section className="driver-panel">
        <h2>Driver Details</h2>
        <p className="driver-muted">Select a driver from the leaderboard or track.</p>
      </section>
    );
  }

  return (
    <section className="driver-panel">
      <div className="driver-panel-heading">
        <div>
          <p className="driver-kicker">Driver {selectedDriver}</p>
          <h2>{driverInfo?.full_name || "Driver details"}</h2>
        </div>
        {driverInfo?.name_acronym && (
          <span className="driver-code">{driverInfo.name_acronym}</span>
        )}
      </div>

      <div className="driver-detail-grid">
        <div>
          <span>Team</span>
          <strong>{driverInfo?.team_name || "Unknown"}</strong>
        </div>
        <div>
          <span>Country</span>
          <strong>{driverInfo?.country_code || "TBD"}</strong>
        </div>
        <div>
          <span>Session</span>
          <strong>{isLive ? "Live" : race?.session_name || "Upcoming"}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>
            {car?.x != null && car?.y != null ? `${Math.round(car.x)}, ${Math.round(car.y)}` : "No live position"}
          </strong>
        </div>
      </div>
    </section>
  );
}

export default DriverPanel;
