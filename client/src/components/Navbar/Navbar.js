import { useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()

  return (
    <div className="navbar">
      <h1 onClick={() => navigate("/")}>F1 LIVE DASHBOARD</h1>
    </div>
  )
}

export default Navbar