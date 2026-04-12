import Navbar from "../components/Navbar/Navbar"
import Leaderboard from "../components/Leaderboard/Leaderboard"
import Canvas from "../components/Canvas/Canvas"
import RaceInfo from "../components/RaceInfo/RaceInfo.js"
import "./Dashboard.css"

function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar />

      <div className="main">
        <div className="left">
          <Leaderboard />
        </div>

        <div className="center">
          <Canvas />
        </div>

        <div className="right">
          <RaceInfo />
        </div>
      </div>
    </div>
  )
}

export default Dashboard