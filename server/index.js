import express from "express"
import axios from "axios"
import cors from "cors"

const app = express()
app.use(cors())

// 🔥 SWITCH (VERY IMPORTANT)
const SESSION_KEY = "latest" // ✅ real-time
// const SESSION_KEY = "9641" // ✅ DEV MODE (uncomment to test movement)


// =======================
// 🚀 RACE INFO API
// =======================
app.get("/api/race", async (req, res) => {
  console.log("API HIT 🚀")

  try {
    let isLive = false
    let cars = []
    let nextRace = null
    let trackImage = null

    // 🟢 1. CHECK LIVE DATA
    try {
      const liveRes = await axios.get(
        `https://api.openf1.org/v1/positions?session_key=${SESSION_KEY}`
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

    // 🟡 2. GET NEXT RACE
    try {
      const scheduleRes = await axios.get(
        "https://api.openf1.org/v1/sessions"
      )

      const now = new Date()

      const raceSessions = scheduleRes.data.filter(session =>
        session.session_name &&
        session.session_name.toLowerCase().includes("race")
      )

      const futureRaces = raceSessions.filter(session =>
        new Date(session.date_start) > now
      )

      futureRaces.sort(
        (a, b) => new Date(a.date_start) - new Date(b.date_start)
      )

      nextRace = futureRaces[0] || null

    } catch (err) {
      console.log("Schedule fetch error:", err.message)
    }

    // 🔥 3. GET TRACK IMAGE (ROBUST MATCH)
    try {
      if (nextRace) {
        const meetingRes = await axios.get(
          "https://api.openf1.org/v1/meetings"
        )

        const meeting = meetingRes.data.find(
          m =>
            m.circuit_short_name &&
            nextRace.circuit_short_name &&
            m.circuit_short_name.toLowerCase() ===
              nextRace.circuit_short_name.toLowerCase()
        )

        trackImage = meeting?.circuit_image || null
      }
    } catch (err) {
      console.log("Track image fetch error:", err.message)
    }

    return res.json({
      isLive,
      cars,
      race: nextRace,
      trackImage
    })

  } catch (err) {
    console.log("Server error:", err.message)

    return res.json({
      isLive: false,
      cars: [],
      race: null,
      trackImage: null
    })
  }
})


// =======================
// 🚗 LOCATION API (MOVEMENT)
// =======================
app.get("/api/location", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/location?session_key=${SESSION_KEY}`
    )

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return res.json([])
    }

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
    console.log("Location API error:", err.message)
    res.json([])
  }
})


// =======================
// 🏎️ DRIVERS API
// =======================
app.get("/api/drivers", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/drivers?session_key=${SESSION_KEY}`
    )

    res.json(response.data)

  } catch (err) {
    console.log("Drivers API error:", err.message)
    res.json([])
  }
})


// =======================
// 🚀 START SERVER
// =======================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000 🚀")
})