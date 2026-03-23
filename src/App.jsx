import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Background from './components/Background';
import Home from './pages/Home';
import Speakers from './pages/Speakers';
import Program from './pages/Program';
import Reservation from './pages/Reservation';
import ConfirmReservation from './pages/ConfirmReservation';
import CancelReservation from './pages/CancelReservation';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReservations from './pages/admin/AdminReservations';
import AdminSpeakers from './pages/admin/AdminSpeakers';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminQRScanner from './pages/admin/AdminQRScanner';
import AdminScanStats from './pages/admin/AdminScanStats';
import AdminHackathon from './pages/admin/AdminHackathon';
import HackathonRegistration from './pages/HackathonRegistration';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Admin Routes (without navbar/footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/speakers" element={<AdminSpeakers />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/qr-scanner" element={<AdminQRScanner />} />
          <Route path="/admin/scan-stats" element={<AdminScanStats />} />
          <Route path="/admin/hackathons" element={<AdminHackathon />} />
        </Route>

        {/* Public Routes (with navbar/footer) */}
        <Route
          path="/*"
          element={
            <>
              <Background />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/speakers" element={<Speakers />} />
                <Route path="/program" element={<Program />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/confirm-reservation" element={<ConfirmReservation />} />
                <Route path="/cancel-reservation" element={<CancelReservation />} />
                <Route path="/hackathon" element={<HackathonRegistration />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

