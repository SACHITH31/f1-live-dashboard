import { useEffect, useRef, useState } from "react"
import { getCars } from "../../services/api"
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

    cars.forEach(car => {
      const x = (car.x || Math.random()) * 700
      const y = (car.y || Math.random()) * 400

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#e10600"
      ctx.fill()
    })
  }, [cars])

  return <canvas ref={canvasRef} width={800} height={500} />
}

export default Canvas