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

app.get("/api/location", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openf1.org/v1/location?session_key=latest"
    )

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return res.json([])
    }

    // ✅ latest position per driver
    const latest = Object.values(
      response.data.reduce((acc, curr) => {
        if (
          !acc[curr.driver_number] ||
          new Date(curr.date) > new Date(acc[curr.driver_number].date)
        ) {
          acc[curr.driver_number] = curr
        }
        return acc
      }, {})
    )

    const cars = latest.map(car => ({
      driver: car.driver_number,
      x: car.x,
      y: car.y
    }))

    res.json(cars)

  } catch (err) {
    console.log("Location API error")
    res.json([])
  }
})

app.get("/api/drivers", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openf1.org/v1/drivers?session_key=latest"
    )

    res.json(response.data)
  } catch (err) {
    console.log("Drivers API error")
    res.json([])
  }
})

app.listen(5000, () => console.log("Server running on 5000"))