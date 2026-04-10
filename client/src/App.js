import { useEffect } from "react"

function App() {

  useEffect(() => {
    fetch("http://localhost:5000/api/cars")
      .then(res => res.json())
      .then(data => console.log(data))
  }, [])

  return (
    <h1>F1 Live Dashboard 🚗</h1>
  )
}

export default App