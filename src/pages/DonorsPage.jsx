import { MapPin, Phone, UserCheck, UserX } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const LOCATIONS = ["KPHB", "Gachibowli", "Madhapur", "Kukatpally"]

function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [location, setLocation] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const filters = {}
    if (bloodGroup) filters.bloodGroup = bloodGroup
    if (location) filters.location = location
    api.getDonors(filters)
      .then((d) => setDonors(d.donors || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [bloodGroup, location])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Blood Donors</h2>
          <p className="mt-1 text-slate-500">Find registered donors by blood group or location</p>
        </div>
        <button onClick={() => navigate("/register-donor")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          + Register as Donor
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {loading && <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">Loading donors...</p>}
      {error && <p className="rounded-lg bg-rose-50 p-4 text-rose-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {donors.map((donor) => (
          <div key={donor._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{donor.name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{donor.location}</p>
                <p className="flex items-center gap-1 text-sm text-slate-500"><Phone size={13} />{donor.phone}</p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">{donor.bloodGroup}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${donor.available ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-slate-100 text-slate-500"}`}>
                {donor.available ? <><UserCheck size={12} /> Available</> : <><UserX size={12} /> Unavailable</>}
              </span>
              {donor.available && (
                <a href={`tel:${donor.phone}`} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                  Contact
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {!loading && !error && donors.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">No donors found for selected filters.</p>
      )}
    </div>
  )
}

export default DonorsPage
