import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RacePage from "./pages/RacePage";
import CalendarPage from "./pages/CalendarPage";
import CalendarRacePage from "./pages/CalendarRacePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/race" element={<RacePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/:sessionKey" element={<CalendarRacePage />} />
      </Routes>
    </Router>
  );
}

export default App;
