import { useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()

  return (
    <div className="navbar">
      <button className="brand-button" onClick={() => navigate("/")} type="button">
        F1 LIVE DASHBOARD
      </button>
    </div>
  )
}

export default Navbar
