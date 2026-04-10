import { useEffect, useRef, useState } from "react"

function App() {
  const canvasRef = useRef(null)
  const [cars, setCars] = useState([])
  const prevCarsRef = useRef([])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/api/cars")
        .then(res => res.json())
        .then(data => {
          prevCarsRef.current = cars
          setCars(data)
        })
    }, 3000)

    return () => clearInterval(interval)
  }, [cars])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let progress = 0

    function animate() {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      cars.forEach((car, index) => {
        const prev = prevCarsRef.current[index] || {}

        const x1 = (prev.x || Math.random()) * 500
        const y1 = (prev.y || Math.random()) * 400

        const x2 = (car.x || Math.random()) * 500
        const y2 = (car.y || Math.random()) * 400

        const x = x1 + (x2 - x1) * progress
        const y = y1 + (y2 - y1) * progress

        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = "red"
        ctx.fill()
      })

      progress += 0.02
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [cars])

  return (
    <div style={{ background: "black", color: "white", height: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "red" }}>
        F1 Live Dashboard 🏎️
      </h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ display: "block", margin: "auto", border: "1px solid red" }}
      />
    </div>
  )
}

export default App