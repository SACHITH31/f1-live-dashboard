const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

app.use(cors())

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working 🚀" })
})

const USE_MOCK = true   // 👈 ADD THIS AT TOP (outside route)

app.get("/api/cars", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.openf1.org/v1/positions?session_key=latest"
        )

        // ✅ IF NO LIVE DATA
        if (!Array.isArray(response.data) || response.data.length === 0) {

            if (USE_MOCK) {
                const mockCars = Array.from({ length: 10 }).map((_, i) => ({
                    driver: i + 1
                }))

                return res.json({
                    isLive: true,
                    cars: mockCars
                })
            }

            return res.json({
                isLive: false,
                cars: []
            })
        }

        // ✅ REAL DATA
        const cars = response.data.map(car => ({
            driver: car.driver_number
        }))

        res.json({
            isLive: true,
            cars
        })

    } catch (error) {

        // ✅ HANDLE ERROR WITH MOCK
        if (USE_MOCK) {
            const mockCars = Array.from({ length: 10 }).map((_, i) => ({
                driver: i + 1
            }))

            return res.json({
                isLive: true,
                cars: mockCars
            })
        }

        return res.json({
            isLive: false,
            cars: []
        })
    }
})

app.get("/api/race", (req, res) => {
    const now = new Date()

    const raceTime = new Date()
    raceTime.setHours(19, 30, 0) // 7:30 PM today

    const isLive = now >= raceTime

    res.json({
        name: "Bahrain Grand Prix",
        time: raceTime,
        isLive
    })
})


app.listen(5000, () => {
    console.log("✅ Server running on port 5000")
})