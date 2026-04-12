import { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import Leaderboard from "../components/Leaderboard/Leaderboard"
import Canvas from "../components/Canvas/Canvas"
import RaceInfo from "../components/RaceInfo/RaceInfo"
import { getCars } from "../services/api"
import "./Dashboard.css"

function Dashboard() {
  const [cars, setCars] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchCars = async () => {
      try {
        const data = await getCars()

        if (isMounted && Array.isArray(data)) {
          setCars(data)
        }
      } catch (err) {
        console.log("Error fetching cars:", err)
      }
    }

    // ✅ initial fetch (important)
    fetchCars()

    // ✅ controlled interval
    const interval = setInterval(fetchCars, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="dashboard">
      <Navbar />

      <div className="main">
        <div className="left">
          <Leaderboard
            cars={cars}
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
          <RaceInfo />
        </div>
      </div>
    </div>
  )
}

export default Dashboard