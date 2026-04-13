import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import RacePage from "./pages/RacePage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/race" element={<RacePage />} />
      </Routes>
    </Router>
  )
}

export default App