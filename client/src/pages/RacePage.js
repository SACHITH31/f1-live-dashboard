import { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import { getRaceData } from "../services/api"
import "./RacePage.css"

function RacePage() {
  const [race, setRace] = useState(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRaceData()
      if (!data) return

      setRace(data.race)
      setIsLive(data.isLive)
    }

    fetchData()
  }, [])

  return (
    <div className="race-page">
      <Navbar />

      {isLive ? (
        <h2 className="live-text">LIVE RACE 🔴</h2>
      ) : (
        <div className="race-details">
          <h2>UPCOMING RACE</h2>
          <p>{race?.location} - {race?.country_name}</p>
          <p>{new Date(race?.date_start).toLocaleString()}</p>

          <div className="track">
            <p>Track Visualization Coming...</p>
          </div>

          <div className="drivers">
            <p>Drivers & Teams Coming...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RacePage