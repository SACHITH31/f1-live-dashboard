import { useEffect, useRef } from "react"
import { trackPath } from "../../services/track"
import { teamColors } from "../../services/teams"
import "./Canvas.css"

function Canvas({ cars, selectedDriver, setSelectedDriver }) {
  const canvasRef = useRef(null)

  const carPositions = useRef({})
  const carProgress = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let animationFrameId

    const animate = () => {
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

      // 🚗 MOVE + DRAW CARS
      cars.forEach((car) => {
        // 🧠 INIT PROGRESS
        if (!carProgress.current[car.driver]) {
          carProgress.current[car.driver] = Math.random() * trackPath.length
        }

        // 🔥 INCREASE PROGRESS (THIS MAKES MOVEMENT)
        carProgress.current[car.driver] += 0.02

        if (carProgress.current[car.driver] >= trackPath.length) {
          carProgress.current[car.driver] = 0
        }

        const index = Math.floor(carProgress.current[car.driver])
        const nextIndex = (index + 1) % trackPath.length

        const t = carProgress.current[car.driver] - index

        const p1 = trackPath[index]
        const p2 = trackPath[nextIndex]

        // 🧠 INTERPOLATE BETWEEN POINTS
        const x = p1.x + (p2.x - p1.x) * t
        const y = p1.y + (p2.y - p1.y) * t

        carPositions.current[car.driver] = { x, y }

        const color = teamColors[car.driver] || "#e10600"

        ctx.beginPath()
        ctx.arc(x, y, 7, 0, 2 * Math.PI)

        // glow
        ctx.shadowBlur = 10
        ctx.shadowColor = color

        ctx.fillStyle = color
        ctx.fill()

        ctx.shadowBlur = 0

        // highlight
        if (selectedDriver === car.driver) {
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, 2 * Math.PI)
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [cars, selectedDriver])

  // 🖱️ CLICK
  const handleClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cars.forEach((car) => {
      const pos = carPositions.current[car.driver]
      if (!pos) return

      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)

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