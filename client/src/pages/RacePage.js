import { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import Canvas from "../components/Canvas/Canvas"
import Leaderboard from "../components/Leaderboard/Leaderboard"
import { getRaceData, getDrivers } from "../services/api"
import "./RacePage.css"

function RacePage() {
  const [race, setRace] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [cars, setCars] = useState([])
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)

  // 🔥 FETCH RACE DATA
  useEffect(() => {
    let interval

    const fetchData = async () => {
      const data = await getRaceData()
      if (!data) return

      setRace(data.race)
      setIsLive(data.isLive)

      if (Array.isArray(data.cars)) {
        setCars(data.cars)
      }

      if (data.isLive) {
        clearInterval(interval)
        interval = setInterval(fetchData, 3000)
      }
    }

    fetchData()

    return () => clearInterval(interval)
  }, [])

  // 🔥 FETCH DRIVERS (ONLY ONCE)
  useEffect(() => {
    const fetchDrivers = async () => {
      const data = await getDrivers()
      if (Array.isArray(data)) {
        setDrivers(data)
      }
    }

    fetchDrivers()
  }, [])

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
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </div>

          <div className="right">
            <h2>LIVE 🔴</h2>
            <p>{race?.location} - {race?.country_name}</p>
          </div>

        </div>
      ) : (
        <div className="race-details">
          <h2>UPCOMING RACE</h2>
          <p>{race?.location} - {race?.country_name}</p>
          <p>{new Date(race?.date_start).toLocaleString()}</p>

          <div className="track-box">
            <Canvas cars={[]} />
          </div>

          <div className="drivers-box">
            <p>Drivers will be available during live race</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RacePage