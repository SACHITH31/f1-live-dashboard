import { useEffect, useRef } from "react"
import { driversData } from "../../services/teams"
import "./Canvas.css"

function Canvas({ cars, trackImage, selectedDriver, setSelectedDriver }) {
  const trackImgRef = useRef(null)
  const canvasRef = useRef(null)
  const prevCarsRef = useRef([])

  const scale = (val, min, max, size) => {
    if (max - min === 0) return size / 2
    return ((val - min) / (max - min)) * size
  }
  useEffect(() => {
  if (!trackImage) return

  const img = new Image()
  img.src = trackImage

  img.onload = () => {
    trackImgRef.current = img
  }
}, [trackImage])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let animationFrameId

    const animate = () => {
      if (trackImgRef.current) {
  ctx.drawImage(trackImgRef.current, 0, 0, canvas.width, canvas.height)
} else {
  ctx.fillStyle = "#0a0b0d"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

      if (!cars || cars.length === 0) {
        ctx.fillStyle = "#888"
        ctx.font = "16px Arial"
        // ctx.fillText("No Live Race Data", 300, 250)
        return
      }

      const xs = cars.map(c => c.x)
      const ys = cars.map(c => c.y)

      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)

      cars.forEach((car, i) => {
        const prev = prevCarsRef.current[i] || car

        const smoothX = prev.x + (car.x - prev.x) * 0.1
        const smoothY = prev.y + (car.y - prev.y) * 0.1

        const x = scale(smoothX, minX, maxX, canvas.width)
        const y = scale(smoothY, minY, maxY, canvas.height)

        const driver = driversData[car.driver]
        const color = driver?.color || "#e10600"

        // 🚗 Draw car
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)

        ctx.shadowBlur = 10
        ctx.shadowColor = color

        ctx.fillStyle = color
        ctx.fill()

        ctx.shadowBlur = 0

        // 🟢 Label
        ctx.fillStyle = "#e0e0e0"
        ctx.font = "10px Arial"
        ctx.fillText(car.driver, x + 8, y)

        // 🔥 Highlight
        if (selectedDriver === car.driver) {
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, 2 * Math.PI)
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Save smooth pos
        prevCarsRef.current[i] = { x: smoothX, y: smoothY }
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

    cars.forEach((car, i) => {
      const prev = prevCarsRef.current[i]
      if (!prev) return

      const dx = scale(prev.x, 0, 1000, canvas.width)
      const dy = scale(prev.y, 0, 1000, canvas.height)

      const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2)

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