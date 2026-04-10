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
        const response = await axios.get("https://api.openf1.org/v1/drivers")
        res.json(response.data)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Failed to fetch car data" })
    }
})

app.listen(5000, () => {
    console.log("✅ Server running on port 5000")
})