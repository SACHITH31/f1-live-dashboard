import { useEffect, useRef, useState } from "react"
import { getCars } from "../../services/api"
import { trackPath } from "../../services/track"
import "./Canvas.css"

function Canvas() {
  const canvasRef = useRef(null)
  const [cars, setCars] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      getCars().then(data => setCars(data))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#0b0b0b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 🛣️ Draw track
    ctx.beginPath()
    ctx.strokeStyle = "#444"
    ctx.lineWidth = 3

    trackPath.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })

    ctx.closePath()
    ctx.stroke()

    // 🚗 Draw cars on track
    cars.forEach((car, i) => {
      const index = i % trackPath.length
      const point = trackPath[index]

      ctx.beginPath()
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#e10600"
      ctx.fill()
    })

  }, [cars])

  return <canvas ref={canvasRef} width={800} height={500} />
}

export default Canvas