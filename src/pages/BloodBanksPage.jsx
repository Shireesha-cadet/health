import { Droplets, MapPin, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../api"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const LOCATIONS = ["KPHB", "Gachibowli", "Madhapur", "Kukatpally"]

function BloodBanksPage() {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [location, setLocation] = useState("")
  const [filterGroup, setFilterGroup] = useState("")

  useEffect(() => {
    setLoading(true)
    api.getBloodBanks(location || undefined)
      .then((d) => setBanks(d.bloodBanks || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [location])

  const filtered = filterGroup
    ? banks.filter((b) => (b.bloodGroups?.[filterGroup] || 0) > 0)
    : banks

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Blood Banks</h2>
        <p className="mt-1 text-slate-500">Find blood banks and available blood groups near you</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      {loading && <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">Loading blood banks...</p>}
      {error && <p className="rounded-lg bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((bank) => (
          <div key={bank._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{bank.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{bank.location}</p>
                <p className="flex items-center gap-1 text-sm text-slate-500"><Phone size={13} />{bank.contact}</p>
                <p className="text-xs text-slate-400">{bank.address}</p>
              </div>
              <Droplets size={28} className="text-red-400" />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Available Blood Groups</p>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map((g) => {
                  const units = bank.bloodGroups?.[g] || 0
                  return (
                    <span key={g} className={`rounded-full px-3 py-1 text-xs font-semibold ${units > 0 ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-slate-100 text-slate-400"}`}>
                      {g}: {units}u
                    </span>
                  )
                })}
              </div>
            </div>

            <a href={`tel:${bank.contact}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              <Phone size={14} /> Call Now
            </a>
          </div>
        ))}
      </div>
      {!loading && !error && filtered.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">No blood banks found.</p>
      )}
    </div>
  )
}

export default BloodBanksPage
