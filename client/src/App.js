import { useEffect, useRef, useState } from "react"

function App() {
  const canvasRef = useRef(null)
  const [cars, setCars] = useState([])

  useEffect(() => {
  const interval = setInterval(() => {
    fetch("http://localhost:5000/api/cars")
      .then(res => res.json())
      .then(data => setCars(data))
  }, 3000)

  return () => clearInterval(interval)
}, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    cars.forEach(car => {
      const x = (car.x || Math.random()) * 500
      const y = (car.y || Math.random()) * 400

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "red"
      ctx.fill()
    })
  }, [cars])

  return (
    <div>
      <h1>F1 Live Dashboard 🚗</h1>
      <canvas ref={canvasRef} width={600} height={400} style={{ border: "1px solid black" }} />
    </div>
  )
}

export default App