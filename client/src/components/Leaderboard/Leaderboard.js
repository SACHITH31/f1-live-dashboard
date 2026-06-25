import "./Leaderboard.css";
import teamLogos from "../../services/teamLogos";

function Leaderboard({
  cars,
  drivers,
  selectedDriver,
  setSelectedDriver,
  isFavoriteDriver,
  isFavoriteTeam,
  toggleFavoriteDriver,
}) {
  const merged = cars.map((car, index) => {
    const driverInfo = drivers.find((d) => d.driver_number === car.driver);
    const teamColor = driverInfo?.team_colour
      ? `#${driverInfo.team_colour}`
      : "#e10600";
    const team = driverInfo?.team_name || "Unknown team";

    return {
      position: index + 1,
      driver: car.driver,
      name: driverInfo?.full_name || `Driver ${car.driver}`,
      team,
      color: teamColor,
      logo: teamLogos[driverInfo?.team_name] || null,
      isFavorite:
        isFavoriteDriver?.(car.driver) || isFavoriteTeam?.(team) || false,
    };
  }).sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.position - b.position);

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>

      {merged.length === 0 && (
        <p className="empty-leaderboard">Waiting for live car data...</p>
      )}

      {merged.map((driver) => (
        <button
          key={driver.driver}
          className={`driver-row ${
            selectedDriver === driver.driver ? "active" : ""
          } ${driver.isFavorite ? "favorite" : ""}`}
          onClick={() => setSelectedDriver?.(driver.driver)}
          type="button"
        >
          <span className="pos">{driver.position}</span>

          <span
            className="color-bar"
            style={{ background: driver.color }}
            aria-hidden="true"
          />

          {driver.logo && (
            <img
              className="team-logo"
              src={driver.logo}
              alt={`${driver.team} logo`}
            />
          )}

          <span className="info">
            <span className="name">{driver.name}</span>
            <span className="team">{driver.team}</span>
          </span>

          <span
            className="favorite-toggle"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavoriteDriver?.(driver.driver);
            }}
            aria-label={
              driver.isFavorite
                ? `Remove ${driver.name} from favorites`
                : `Add ${driver.name} to favorites`
            }
          >
            {driver.isFavorite ? "★" : "☆"}
          </span>
        </button>
      ))}
    </div>
  );
}

export default Leaderboard;
