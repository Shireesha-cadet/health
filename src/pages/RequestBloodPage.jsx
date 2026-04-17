import { AlertTriangle, Droplets, MapPin, Phone, UserCheck } from "lucide-react"
import { useState } from "react"
import { api } from "../api"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const LOCATIONS = ["KPHB", "Gachibowli", "Madhapur", "Kukatpally"]
const URGENCY = ["Normal", "Urgent", "Critical"]

function RequestBloodPage() {
  const [form, setForm] = useState({ bloodGroup: "", patientName: "", location: "", urgency: "Normal" })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResults(null)
    try {
      const data = await api.requestBlood({ bloodGroup: form.bloodGroup, location: form.location })
      setResults(data)
    } catch (err) {
      setError(err.message || "Search failed")
    } finally {
      setLoading(false)
    }
  }

  const urgencyColor = { Normal: "bg-green-50 text-green-700", Urgent: "bg-amber-50 text-amber-700", Critical: "bg-red-50 text-red-700" }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Request Blood</h2>
        <p className="mt-1 text-slate-500">Find matching donors and blood banks instantly</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name</label>
            <input name="patientName" value={form.patientName} onChange={handleChange} required placeholder="Patient's full name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Required Blood Group</label>
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400">
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
            <select name="location" value={form.location} onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400">
              <option value="">Any Location</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Urgency Level</label>
            <select name="urgency" value={form.urgency} onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400">
              {URGENCY.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {form.urgency === "Critical" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            <AlertTriangle size={16} /> Critical request — please also call 108 for emergency ambulance.
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? "Searching..." : "Find Donors & Blood Banks"}
        </button>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      </form>

      {results && (
        <div className="space-y-6">
          {/* Urgency badge */}
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${urgencyColor[form.urgency]} ring-current/20`}>
            <AlertTriangle size={14} /> {form.urgency} Request — {form.bloodGroup}
          </div>

          {/* Matching Donors */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              Matching Donors ({results.donors?.length || 0})
            </h3>
            {results.donors?.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">No available donors found for {form.bloodGroup} in selected area.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {results.donors.map((d) => (
                  <div key={d._id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-slate-900">{d.name}</p>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{d.bloodGroup}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} />{d.location}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><Phone size={11} />{d.phone}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600"><UserCheck size={11} /> Available</span>
                      <a href={`tel:${d.phone}`} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">Call</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matching Blood Banks */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              Blood Banks with {form.bloodGroup} ({results.bloodBanks?.length || 0})
            </h3>
            {results.bloodBanks?.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">No blood banks found with {form.bloodGroup} available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.bloodBanks.map((b) => (
                  <div key={b._id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{b.name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} />{b.location}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500"><Phone size={11} />{b.contact}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700 ring-1 ring-red-200">
                        <Droplets size={12} /> {b.bloodGroups?.[form.bloodGroup]}u
                      </span>
                    </div>
                    <a href={`tel:${b.contact}`} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                      <Phone size={12} /> Call Bank
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default RequestBloodPage
