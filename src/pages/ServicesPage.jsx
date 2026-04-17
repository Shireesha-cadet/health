import { useEffect, useState } from "react"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

function ServicesPage() {
  const user = getCurrentUser()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await api.getAppointments(user._id)
        setAppointments(response.appointments || [])
      } catch (requestError) {
        setError(requestError.message || "Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [user._id])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Services</h2>
        <p className="mt-1 text-slate-500">Your booked doctor appointments</p>
      </header>

      {loading && <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">Loading appointments...</p>}
      {error && <p className="rounded-lg bg-rose-100 p-4 text-rose-700">Failed to load data: {error}</p>}

      {!loading && !error && <section className="grid gap-4 md:grid-cols-2">
        {appointments.map((appointment) => (
          <article key={appointment._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{appointment.doctorName}</h3>
            <p className="text-sm text-slate-600">{appointment.specialization} • {appointment.hospitalName}</p>
            <p className="mt-1 text-sm text-slate-500">{appointment.location} • Slot: {appointment.slot}</p>
            <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{appointment.status}</span>
          </article>
        ))}
        {appointments.length === 0 && <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">No appointments booked yet. Use Doctors page to book.</p>}
      </section>}
    </div>
  )
}

export default ServicesPage
