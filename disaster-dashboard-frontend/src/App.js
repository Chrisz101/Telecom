import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StatePage from './components/StatePage';
import CountyPage from './components/CountyPage';
import HospitalPage from './components/HospitalPage';
import AnalyticsPage from './components/AnalyticsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/state/:stateName" element={<StatePage />} />
        <Route path="/county/:countyName" element={<CountyPage />} />
        <Route path="/hospital/:countyName/:hospitalName" element={<HospitalPage />} /> {/* <-- FIXED */}
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
