import { ArrowLeft, Bed, FlaskConical, Star, Stethoscope, Clock, CalendarCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../api"

// Mock bed data generated per hospital id (stable per session)
function getMockBeds(id) {
  const seed = id ? id.charCodeAt(id.length - 1) : 5
  return {
    icu: (seed % 8) + 2,
    general: (seed % 20) + 10,
    emergency: (seed % 5) + 1,
  }
}

// Mock lab services
const LAB_SERVICES = [
  { name: "Blood Test", available: true },
  { name: "X-Ray", available: true },
  { name: "MRI", available: false },
  { name: "ECG", available: true },
  { name: "CT Scan", available: false },
  { name: "Ultrasound", available: true },
]

function HospitalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hospital, setHospital] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [beds, setBeds] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const { hospital: h } = await api.getHospitalById(id)
        setHospital(h)
        setBeds(getMockBeds(id))
        const { doctors: d } = await api.getDoctorsByHospital(h.name)
        setDoctors(d || [])
      } catch (err) {
        setError(err.message || "Failed to load hospital data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading hospital details...</p>
      </div>
    )
  }

  if (error || !hospital) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/hospitals")} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <ArrowLeft size={16} /> Back to Hospitals
        </button>
        <p className="rounded-lg bg-rose-100 p-4 text-rose-700">Failed to load hospital data: {error}</p>
      </div>
    )
  }

  // Build Google Maps embed URL from the link
  const mapQuery = encodeURIComponent(`${hospital.name} ${hospital.location}`)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`

  return (
    <div className="space-y-6 pb-10">
      {/* Back button */}
      <button
        onClick={() => navigate("/hospitals")}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} /> Back to Hospitals
      </button>

      {/* ── MAP SECTION ── */}
      <section className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
        <iframe
          title={`Map of ${hospital.name}`}
          src={mapEmbedUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </section>

      {/* ── HOSPITAL INFO ── */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <img src={hospital.image} alt={hospital.name} className="h-52 w-full object-cover" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
              <p className="mt-1 text-slate-500">{hospital.specialization}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 ring-1 ring-amber-200">
              <Star size={14} fill="currentColor" /> {hospital.rating} / 5
            </span>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p><span className="font-medium text-slate-800">Location:</span> {hospital.location}</p>
            <p><span className="font-medium text-slate-800">Contact:</span> +91 98765 43210</p>
            <p><span className="font-medium text-slate-800">Email:</span> info@{hospital.name.toLowerCase().replace(/\s+/g, "")}.com</p>
            <p><span className="font-medium text-slate-800">Open:</span> 24 / 7</p>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            A leading {hospital.specialization} facility in {hospital.location}, providing quality healthcare services with modern infrastructure and experienced medical professionals.
          </p>
          <a
            href={hospital.googleMapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </section>

      {/* ── BED AVAILABILITY ── */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Bed size={20} className="text-blue-500" /> Bed Availability
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "ICU Beds", count: beds.icu, color: "rose" },
            { label: "General Beds", count: beds.general, color: "green" },
            { label: "Emergency Beds", count: beds.emergency, color: "amber" },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-xl bg-${color}-50 p-4 ring-1 ring-${color}-100`}>
              <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-500">available</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Stethoscope size={20} className="text-blue-500" /> Doctors Available
        </h2>
        {doctors.length === 0 ? (
          <p className="text-sm text-slate-500">No doctors listed for this hospital.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doc) => (
              <div key={doc._id} className="rounded-xl border border-slate-100 p-4 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-sm text-blue-600">{doc.specialization}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                    <Star size={13} fill="currentColor" /> {doc.rating}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1"><Clock size={12} /> {doc.workingHours}</p>
                  <p className="flex items-center gap-1">
                    <CalendarCheck size={12} />
                    Slots: {doc.availableSlots?.join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── LAB SERVICES ── */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <FlaskConical size={20} className="text-blue-500" /> Lab Services
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {LAB_SERVICES.map((lab) => (
            <div
              key={lab.name}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ring-1 ${
                lab.available
                  ? "bg-green-50 ring-green-100 text-green-800"
                  : "bg-slate-50 ring-slate-100 text-slate-400"
              }`}
            >
              <span className="font-medium">{lab.name}</span>
              <span>{lab.available ? "✔ Available" : "✖ Not Available"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HospitalDetailPage
