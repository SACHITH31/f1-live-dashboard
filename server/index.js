import express from "express"
import axios from "axios"
import cors from "cors"

const app = express()
app.use(cors())

app.get("/api/race", async (req, res) => {
  console.log("API HIT 🚀")
  try {
    // 🟢 1. CHECK LIVE DATA
    const liveRes = await axios.get(
      "https://api.openf1.org/v1/positions?session_key=latest"
    )

    const isLive =
      Array.isArray(liveRes.data) && liveRes.data.length > 0

    // 🟡 2. GET SCHEDULE DATA
    const scheduleRes = await axios.get(
      "https://api.openf1.org/v1/sessions?year=2025"
    )
    console.log("All sessions:", scheduleRes.data)
    // 👉 find next race
    const now = new Date()

    const nextRace = scheduleRes.data
        .filter(race => new Date(race.date_start) > now)
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))[0]
    
        console.log("Next race:", nextRace)

    // 🟢 LIVE MODE
    if (isLive) {
      const cars = liveRes.data.map(car => ({
        driver: car.driver_number
      }))

      return res.json({
        isLive: true,
        cars,
        race: nextRace || null
      })
    }

    // 🔴 NOT LIVE
    return res.json({
      isLive: false,
      cars: [],
      race: nextRace || null
    })

  } catch (err) {
    return res.json({
      isLive: false,
      cars: [],
      race: null
    })
  }
})

app.listen(5000, () => console.log("Server running on 5000"))