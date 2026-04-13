import "./RaceInfo.css"

function RaceInfo({ race, isLive }) {
  if (!race && !isLive) {
    return (
      <div className="race-info">
        <p>No race data available</p>
      </div>
    )
  }

  return (
    <div className="race-info">
      {isLive ? (
        <>
          <h2>LIVE RACE 🔴</h2>
          {race && (
            <>
              <p>{race.session_name}</p>
              <p>{race.date_start}</p>
            </>
          )}
        </>
      ) : (
        <>
          <h2>UPCOMING RACE</h2>
          <p>{race?.session_name}</p>
          <p>{race?.date_start}</p>
        </>
      )}
    </div>
  )
}

export default RaceInfo