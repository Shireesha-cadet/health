import { CheckCircle, Clock, PlusCircle, Trash2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

const STATUS_STYLE = {
  taken:   "bg-green-50 text-green-700 ring-green-200",
  missed:  "bg-rose-50 text-rose-700 ring-rose-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
}
const STATUS_ICON = {
  taken:   <CheckCircle size={13} />,
  missed:  <XCircle size={13} />,
  pending: <Clock size={13} />,
}

export default function MedicinesPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [adherence, setAdherence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const [mRes, aRes] = await Promise.all([
        api.getMedicines(user._id),
        api.getAdherence(user._id),
      ])
      setMedicines(mRes.medicines || [])
      setAdherence(aRes)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm("Remove this medicine?")) return
    await api.deleteMedicine(id)
    load()
  }

  const handleMark = async (medicineId, logId, status) => {
    await api.markDose({ medicineId, logId, status })
    load()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Medicine Reminders</h2>
          <p className="mt-1 text-slate-500">Track your daily medication schedule</p>
        </div>
        <button onClick={() => navigate("/add-medicine")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <PlusCircle size={16} /> Add Medicine
        </button>
      </header>

      {/* Adherence */}
      {adherence && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Taken", value: adherence.taken, color: "green" },
            { label: "Missed", value: adherence.missed, color: "rose" },
            { label: "Adherence", value: adherence.adherence !== null ? `${adherence.adherence}%` : "N/A", color: "blue" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 text-center">
              <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="rounded-lg bg-white p-4 text-slate-500 ring-1 ring-slate-100">Loading medicines...</p>}
      {error && <p className="rounded-lg bg-rose-50 p-4 text-rose-700">{error}</p>}

      {!loading && medicines.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-4xl mb-3">💊</p>
          <p className="font-semibold text-slate-700">No medicines added yet</p>
          <p className="mt-1 text-sm text-slate-500">Click "Add Medicine" to set up your first reminder</p>
        </div>
      )}

      <div className="space-y-4">
        {medicines.map((med) => (
          <div key={med._id} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">💊 {med.name}</h3>
                {med.dosage && <p className="text-sm text-slate-500">Dosage: {med.dosage}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  Times: {med.times.join(", ")}
                </p>
              </div>
              <button onClick={() => handleDelete(med._id)} className="text-slate-300 hover:text-rose-500 transition">
                <Trash2 size={18} />
              </button>
            </div>

            {/* Today's dose logs */}
            {med.doseLogs?.length > 0 && (
              <div className="border-t border-slate-100 px-5 pb-4">
                <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Today's Doses</p>
                <div className="space-y-2">
                  {med.doseLogs.map((log) => (
                    <div key={log._id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLE[log.status]}`}>
                          {STATUS_ICON[log.status]} {log.status}
                        </span>
                        <span className="text-sm text-slate-600">
                          {new Date(log.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {log.retryCount > 0 && (
                          <span className="text-xs text-slate-400">({log.retryCount} retries)</span>
                        )}
                      </div>
                      {log.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleMark(med._id, log._id, "taken")}
                            className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">
                            ✅ Taken
                          </button>
                          <button onClick={() => handleMark(med._id, log._id, "missed")}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600">
                            ❌ Missed
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
