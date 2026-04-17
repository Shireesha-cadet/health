import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { ToastContainer } from "./Toast"
import HealthChatbot from "./HealthChatbot"
import MedicineReminderPopup from "./MedicineReminderPopup"

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="ml-64 min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
      <HealthChatbot />
      <MedicineReminderPopup />
    </div>
  )
}

export default AppLayout
