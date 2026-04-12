import { useEffect, useRef } from "react"
import { trackPath } from "../../services/track"
import { teamColors } from "../../services/teams"
import "./Canvas.css"

function Canvas({ cars, selectedDriver, setSelectedDriver }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // clear canvas
    ctx.fillStyle = "#0b0b0d"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 🛣️ DRAW TRACK
    ctx.beginPath()
    ctx.strokeStyle = "#444"
    ctx.lineWidth = 3

    trackPath.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })

    ctx.closePath()
    ctx.stroke()

    // 🚗 DRAW CARS
    cars.forEach((car, i) => {
      const index = i % trackPath.length
      const point = trackPath[index]

      const color = teamColors[car.driver] || "#e10600"

      ctx.beginPath()
      ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI)

      // 🔥 glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = color

      ctx.fillStyle = color
      ctx.fill()

      // reset glow
      ctx.shadowBlur = 0

      // ⭐ highlight selected driver
      if (selectedDriver === car.driver) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

  }, [cars, selectedDriver])

  // 🖱️ CLICK HANDLER
  const handleClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cars.forEach((car, i) => {
      const index = i % trackPath.length
      const point = trackPath[index]

      const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)

      if (dist < 10) {
        setSelectedDriver(car.driver)
      }
    })
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      onClick={handleClick}
    />
  )
}

export default Canvas