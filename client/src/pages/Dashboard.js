import { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import Leaderboard from "../components/Leaderboard/Leaderboard"
import Canvas from "../components/Canvas/Canvas"
import RaceInfo from "../components/RaceInfo/RaceInfo"
import { getRaceData } from "../services/api"
import "./Dashboard.css"

function Dashboard() {
  const [cars, setCars] = useState([])
  const [race, setRace] = useState(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
  let interval

  const fetchData = async () => {
    const data = await getRaceData()
    if (!data) return

    setIsLive(data.isLive)

    if (Array.isArray(data.cars)) {
      setCars(data.cars)
    }

    setRace(data.race)

    // 🟢 If LIVE → fast polling
    if (data.isLive) {
      clearInterval(interval)
      interval = setInterval(fetchData, 3000)
    } else {
      clearInterval(interval)
      interval = setInterval(fetchData, 60000) // 🔥 every 1 minute
    }
  }

  fetchData()

  return () => clearInterval(interval)
}, [])

  return (
    <div className="dashboard">
      <Navbar />

      {/* 🟢 LIVE */}
      {isLive && (
        <div className="main">
          <Leaderboard cars={cars} />
          <Canvas cars={cars} />
          <RaceInfo race={race} isLive={true} />
        </div>
      )}

      {/* 🔴 NOT LIVE */}
      {!isLive && race && (
        <div className="no-live">
          <h2>Next Race</h2>
          <p>{race.session_name}</p>
          <p>{race.date_start}</p>
        </div>
      )}

      {/* ⚠️ NO DATA */}
      {!isLive && !race && (
        <div className="no-data">
          <p>No race data available</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard