const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

app.use(cors())

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working 🚀" })
})

app.get("/api/cars", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.openf1.org/v1/positions?session_key=latest"
        )

        if (!Array.isArray(response.data) || response.data.length === 0) {
            throw new Error("No live data")
        }

        const cars = response.data.map(car => ({
            driver: car.driver_number,
            x: car.x,
            y: car.y
        }))

        res.json(cars)

    } catch (error) {
        console.log("Using fallback data")

        // 🔥 Fallback simulated data
        const mockCars = Array.from({ length: 10 }).map((_, i) => ({
            driver: i + 1,
            x: Math.random() * 1000,
            y: Math.random() * 1000
        }))

        res.json(mockCars)
    }
})

app.listen(5000, () => {
    console.log("✅ Server running on port 5000")
})