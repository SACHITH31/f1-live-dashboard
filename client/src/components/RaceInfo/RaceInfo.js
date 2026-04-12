import { useEffect, useState } from "react"
import { getRace } from "../../services/api"
import "./RaceInfo.css"

function RaceInfo() {
  const [race, setRace] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    getRace().then(data => setRace(data))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!race) return

      const now = new Date()
      const raceTime = new Date(race.time)

      const diff = raceTime - now

      if (diff <= 0) {
        setTimeLeft("LIVE")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff / (1000 * 60)) % 60)
      const secs = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${hours}h ${mins}m ${secs}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [race])

  if (!race) return null

  return (
    <div className="raceinfo">
      <h2>RACE INFO</h2>

      <p>{race.name}</p>

      <p className="time">
        {race.isLive ? "LIVE NOW 🔴" : timeLeft}
      </p>
    </div>
  )
}

export default RaceInfo