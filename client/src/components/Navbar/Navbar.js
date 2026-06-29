import { useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()

  return (
    <div className="navbar">
      <button className="brand-button" onClick={() => navigate("/")} type="button">
        F1 LIVE DASHBOARD
      </button>

      <nav className="nav-links" aria-label="Main navigation">
        <button onClick={() => navigate("/race")} type="button">
          Race
        </button>
        <button onClick={() => navigate("/calendar")} type="button">
          Calendar
        </button>
        <button onClick={() => navigate("/standings/drivers")} type="button">
          Drivers
        </button>
        <button onClick={() => navigate("/standings/constructors")} type="button">
          Constructors
        </button>
      </nav>
    </div>
  )
}

export default Navbar
