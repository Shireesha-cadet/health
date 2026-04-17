import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import DoctorsPage from './pages/DoctorsPage'
import EmergencySetupPage from './pages/EmergencySetupPage'
import HealthProfileSetupPage from './pages/HealthProfileSetupPage'
import HealthQAPage from './pages/HealthQAPage'
import HealthUpdatePage from './pages/HealthUpdatePage'
import HospitalsPage from './pages/HospitalsPage'
import LoginPage from './pages/LoginPage'
import RecordsPage from './pages/RecordsPage'
import SchemesPage from './pages/SchemesPage'
import ServicesPage from './pages/ServicesPage'
import SosPage from './pages/SosPage'
import { getCurrentUser } from './utils/session'
import { HealthProvider } from './context/HealthContext'

function ProtectedRoute({ children }) {
  const user = getCurrentUser()
  if (!user?._id) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <HealthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
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
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sos" element={<SosPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/health-update" element={<HealthUpdatePage />} />
            <Route path="/health-qa" element={<HealthQAPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HealthProvider>
  )
}

export default App
