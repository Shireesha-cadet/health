import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

export default function AddMedicinePage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [form, setForm] = useState({ name: "", dosage: "", times: ["08:00"], startDate: "", endDate: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addTime = () => setForm(p => ({ ...p, times: [...p.times, "12:00"] }))
  const removeTime = (i) => setForm(p => ({ ...p, times: p.times.filter((_, idx) => idx !== i) }))
  const setTime = (i, v) => setForm(p => ({ ...p, times: p.times.map((t, idx) => idx === i ? v : t) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.addMedicine({ ...form, userId: user._id })
      navigate("/medicines")
    } catch (err) {
      setError(err.message || "Failed to add medicine")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Add Medicine</h2>
        <p className="mt-1 text-slate-500">Set up a daily reminder schedule</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Medicine Name *</label>
          <input value={form.name} onChange={e => setField("name", e.target.value)} required
            placeholder="e.g. Metformin 500mg"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Dosage</label>
          <input value={form.dosage} onChange={e => setField("dosage", e.target.value)}
            placeholder="e.g. 1 tablet, 5ml"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Reminder Times *</label>
            <button type="button" onClick={addTime} className="text-xs font-semibold text-blue-600 hover:underline">+ Add Time</button>
          </div>
          <div className="space-y-2">
            {form.times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" value={t} onChange={e => setTime(i, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                {form.times.length > 1 && (
                  <button type="button" onClick={() => removeTime(i)} className="text-rose-500 hover:text-rose-700 text-lg font-bold">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
            <input type="date" value={form.startDate} onChange={e => setField("startDate", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">End Date (optional)</label>
            <input type="date" value={form.endDate} onChange={e => setField("endDate", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Saving..." : "💊 Save Medicine"}
        </button>
      </form>
    </div>
  )
}
