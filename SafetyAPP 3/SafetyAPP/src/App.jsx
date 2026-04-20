 import { Routes, Route, Navigate } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import BottomNav from './components/BottomNav';
import GlobalSOS from './components/GlobalSOS';
import Landing from './pages/Landing';
import SafetyMap from './pages/SafetyMap';
import SafeRouteFinder from './pages/SafeRouteFinder';
import SafetyScore from './pages/SafetyScore';
import SafeCheckIn from './pages/SafeCheckIn';
import IncidentReport from './pages/IncidentReport';
import SafetyAlerts from './pages/SafetyAlerts';
import SavedRoutes from './pages/SavedRoutes';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

const App = () => {
  return (
    <div className="min-h-screen bg-[#0f2027] text-white">
      <TopNavbar />
      <main className="mx-auto max-w-[1400px] px-4 pb-32 pt-6 xl:px-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<SafetyMap />} />
          <Route path="/route" element={<SafeRouteFinder />} />
          <Route path="/score" element={<SafetyScore />} />
          <Route path="/checkin" element={<SafeCheckIn />} />
          <Route path="/report" element={<IncidentReport />} />
          <Route path="/alerts" element={<SafetyAlerts />} />
          <Route path="/saved" element={<SavedRoutes />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <GlobalSOS />
    </div>
  );
};

export default App;
