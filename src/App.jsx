import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import DoctorsPage from './pages/DoctorsPage'
import EmergencySetupPage from './pages/EmergencySetupPage'
import HealthProfileSetupPage from './pages/HealthProfileSetupPage'
import HealthQAPage from './pages/HealthQAPage'
import HealthUpdatePage from './pages/HealthUpdatePage'
import AddMedicinePage from './pages/AddMedicinePage'
import AmbulanceTrackerPage from './pages/AmbulanceTrackerPage'
import BloodBanksPage from './pages/BloodBanksPage'
import DonorsPage from './pages/DonorsPage'
import HospitalDetailPage from './pages/HospitalDetailPage'
import HospitalsPage from './pages/HospitalsPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MedicinesPage from './pages/MedicinesPage'
import RegisterDonorPage from './pages/RegisterDonorPage'
import RequestBloodPage from './pages/RequestBloodPage'
import RecordsPage from './pages/RecordsPage'
import SchemesPage from './pages/SchemesPage'
import ServicesPage from './pages/ServicesPage'
import SosPage from './pages/SosPage'
import { getCurrentUser } from './utils/session'

function ProtectedRoute({ children }) {
  const user = getCurrentUser()
  if (!user?._id) {
    // Not logged in → back to landing page
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — entry point */}
        <Route path="/" element={<LandingPage />} />

        {/* Login page — existing, untouched */}
        <Route path="/login" element={<LoginPage />} />

        {/* Setup flow */}
        <Route
          path="/setup/contacts"
          element={
            <ProtectedRoute>
              <EmergencySetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup/health"
          element={
            <ProtectedRoute>
              <HealthProfileSetupPage />
            </ProtectedRoute>
          }
        />

        {/* Protected app pages */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/hospital/:id" element={<HospitalDetailPage />} />
          <Route path="/bloodbanks" element={<BloodBanksPage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/register-donor" element={<RegisterDonorPage />} />
          <Route path="/request-blood" element={<RequestBloodPage />} />
          <Route path="/ambulance-tracker" element={<AmbulanceTrackerPage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/add-medicine" element={<AddMedicinePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/health-update" element={<HealthUpdatePage />} />
          <Route path="/health-qa" element={<HealthQAPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
