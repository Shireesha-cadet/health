import { useEffect, useRef, useState } from "react"
import { Bell, X } from "lucide-react"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

const POLL_INTERVAL = 60 * 1000 // check every 60s

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch { /* audio not available */ }
}

export default function MedicineReminderPopup() {
  const user = getCurrentUser()
  const [reminders, setReminders] = useState([])
  const [dismissed, setDismissed] = useState(new Set())
  const shownRef = useRef(new Set())

  const fetchPending = async () => {
    if (!user?._id) return
    try {
      const { pending } = await api.getPendingReminders(user._id)
      const fresh = (pending || []).filter(
        (r) => !shownRef.current.has(r.logId) && !dismissed.has(r.logId)
      )
      if (fresh.length > 0) {
        beep()
        fresh.forEach((r) => shownRef.current.add(r.logId))
        setReminders((prev) => {
          const existingIds = new Set(prev.map((r) => r.logId))
          return [...prev, ...fresh.filter((r) => !existingIds.has(r.logId))]
        })
      }
    } catch { /* silent fail */ }
  }

  useEffect(() => {
    fetchPending()
    const t = setInterval(fetchPending, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [user?._id])

  const handleTaken = async (r) => {
    try { await api.markDose({ medicineId: r.medicineId, logId: r.logId, status: "taken" }) } catch { }
    dismiss(r.logId)
  }

  const handleMissed = async (r) => {
    try { await api.markDose({ medicineId: r.medicineId, logId: r.logId, status: "missed" }) } catch { }
    dismiss(r.logId)
  }

  const handleSnooze = async (r) => {
    try { await api.snoozeDose({ medicineId: r.medicineId, logId: r.logId }) } catch { }
    dismiss(r.logId)
  }

  const dismiss = (logId) => {
    setDismissed((prev) => new Set([...prev, logId]))
    setReminders((prev) => prev.filter((r) => r.logId !== logId))
  }

  if (reminders.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-3 w-[360px] max-w-[calc(100vw-2rem)]">
      {reminders.map((r) => (
        <div key={r.logId}
          className="rounded-2xl bg-white shadow-2xl ring-2 ring-blue-400 animate-bounce-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Bell size={16} className="animate-pulse" />
              <span className="font-semibold text-sm">Medicine Reminder</span>
            </div>
            <button onClick={() => dismiss(r.logId)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-lg font-bold text-slate-900">💊 {r.name}</p>
            {r.dosage && <p className="text-sm text-slate-500">Dosage: {r.dosage}</p>}
            <p className="mt-1 text-sm text-slate-500">
              Scheduled: {new Date(r.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {r.overdue && <span className="ml-2 text-rose-600 font-semibold">⚠️ Overdue</span>}
            </p>
            {r.retryCount > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">Reminder #{r.retryCount + 1}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-slate-100 px-4 pb-4 pt-3">
            <button onClick={() => handleTaken(r)}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700">
              ✅ Taken
            </button>
            <button onClick={() => handleSnooze(r)}
              className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600">
              ⏰ Snooze 15m
            </button>
            <button onClick={() => handleMissed(r)}
              className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600">
              ❌ Missed
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
