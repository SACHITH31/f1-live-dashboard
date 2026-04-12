import "./Leaderboard.css"

function Leaderboard({ cars, selectedDriver, setSelectedDriver }) {
  return (
    <div className="leaderboard">
      <h2>LEADERBOARD</h2>

      {cars.slice(0, 10).map((d, i) => (
        <div
          key={i}
          className={`driver ${selectedDriver === d.driver ? "active" : ""}`}
          onClick={() => setSelectedDriver(d.driver)}
        >
          <span>{i + 1}</span>
          <span>DRIVER {d.driver}</span>
        </div>
      ))}
    </div>
  )
}

export default Leaderboard