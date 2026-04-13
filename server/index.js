import express from "express"
import axios from "axios"
import cors from "cors"

const app = express()
app.use(cors())

app.get("/api/race", async (req, res) => {
  console.log("API HIT 🚀")

  try {
    // 🟢 1. CHECK LIVE DATA
    let isLive = false
    let cars = []

    try {
      const liveRes = await axios.get(
        "https://api.openf1.org/v1/positions?session_key=latest"
      )

      if (Array.isArray(liveRes.data) && liveRes.data.length > 0) {
        isLive = true

        cars = liveRes.data.map(car => ({
          driver: car.driver_number
        }))
      }
    } catch (err) {
      console.log("Live data not available")
    }

    // 🟡 2. GET SCHEDULE DATA (ALL SESSIONS)
    let nextRace = null

    try {
      const scheduleRes = await axios.get(
        "https://api.openf1.org/v1/sessions"
      )

      const now = new Date()

      // ✅ STEP 1: FILTER ONLY RACE SESSIONS
      const raceSessions = scheduleRes.data.filter(session =>
        session.session_name &&
        session.session_name.toLowerCase().includes("race")
      )

      // ✅ STEP 2: FILTER FUTURE RACES
      const futureRaces = raceSessions.filter(session =>
        new Date(session.date_start) > now
      )

      // ✅ STEP 3: SORT BY NEAREST
      futureRaces.sort(
        (a, b) => new Date(a.date_start) - new Date(b.date_start)
      )

      // ✅ STEP 4: PICK NEXT
      nextRace = futureRaces[0] || null

      console.log("Next race:", nextRace)

    } catch (err) {
      console.log("Schedule fetch error:", err.message)
    }

    // 🟢 FINAL RESPONSE
    return res.json({
      isLive,
      cars,
      race: nextRace
    })

  } catch (err) {
    console.log("Server error:", err.message)

    return res.json({
      isLive: false,
      cars: [],
      race: null
    })
  }
})

app.listen(5000, () => console.log("Server running on 5000"))