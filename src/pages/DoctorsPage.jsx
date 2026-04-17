import { useEffect, useState } from "react"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

const specializations = ["", "Cardiologist", "Neurologist", "General Physician", "Diabetologist"]
const locations = ["", "KPHB", "Gachibowli", "Aziznagar"]

function DoctorsPage() {
  const user = getCurrentUser()
  const [filters, setFilters] = useState({ specialization: "", location: "", availability: "" })
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [patientName, setPatientName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      setError("")
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value)
        )
        const response = await api.getDoctors(activeFilters)
        setDoctors(response.doctors || [])
      } catch (requestError) {
        setError(requestError.message || "Failed to load doctors")
      } finally {
        setLoading(false)
      }
    }
    loadDoctors()
  }, [filters])

  const bookSlot = async (event) => {
    event.preventDefault()
    if (!selectedDoctor || !selectedSlot) return
    setBooking(true)
    setError("")
    try {
      await api.bookAppointment({
        userId: user._id,
        doctorId: selectedDoctor._id,
        slot: selectedSlot,
        patientName: patientName || user?.name || "Patient",
      })
      setMessage("Appointment booked successfully.")
      setSelectedDoctor(null)
      setSelectedSlot("")
      setPatientName("")
    } catch (requestError) {
      setError(requestError.message || "Booking failed")
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Doctors</h2>
        <p className="mt-1 text-slate-500">Filter specialists by location and availability.</p>
      </header>

      <section className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:grid-cols-3">
        <select className="rounded-lg border border-slate-200 px-3 py-2" value={filters.specialization} onChange={(e) => setFilters((prev) => ({ ...prev, specialization: e.target.value }))}>
          {specializations.map((item) => <option key={item || "all"} value={item}>{item || "All Specializations"}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 px-3 py-2" value={filters.location} onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}>
          {locations.map((item) => <option key={item || "all"} value={item}>{item || "All Locations"}</option>)}
        </select>
        <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Availability (e.g. 10:00 AM)" value={filters.availability} onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value }))} />
      </section>

      {message && <p className="rounded-lg bg-emerald-100 p-3 text-emerald-800">{message}</p>}
      {error && <p className="rounded-lg bg-rose-100 p-3 text-rose-700">Failed to load data: {error}</p>}

      {loading && <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">Loading doctors...</p>}

      {!loading && doctors.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">No doctors found</p>
      )}

      {!loading && doctors.length > 0 && <section className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <article key={doctor._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{doctor.name}</h3>
            <p className="text-sm text-slate-600">{doctor.specialization} • {doctor.hospitalName}</p>
            <p className="mt-1 text-sm text-slate-500">{doctor.location} • {doctor.workingHours} • ⭐ {doctor.rating}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <button key={slot} onClick={() => { setSelectedDoctor(doctor); setSelectedSlot(slot) }} className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {slot}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>}

      {selectedDoctor && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-semibold text-slate-900">Book Appointment</p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedDoctor.name} - {selectedDoctor.specialization} at {selectedSlot}
            </p>
            <form onSubmit={bookSlot} className="mt-4 space-y-3">
              <input
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Patient name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctor(null)
                    setSelectedSlot("")
                    setPatientName("")
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {booking ? "Booking..." : "Confirm"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default DoctorsPage
