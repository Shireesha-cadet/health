import { useEffect, useRef, useState } from "react"
import { api } from "../api"
import { useHealth } from "../context/HealthContext"
import { getCurrentUser } from "../utils/session"
import { showToast } from "../components/Toast"

function SosPage() {
  const user = getCurrentUser()
  const { alertState, setAlert, clearAlert } = useHealth()
  const [isSending, setIsSending] = useState(false)
  const [emergencyLogs, setEmergencyLogs] = useState([])
  const [resolving, setResolving] = useState(false)
  const pollRef = useRef(null)

  // ── Fetch full log list from backend ──────────────────────────────────────
  const fetchLogs = async () => {
    try {
      const response = await api.getSOSLogs(user._id)
      setEmergencyLogs(response.logs || [])
    } catch {
      // backend unavailable — keep existing list
    }
  }

  // ── Poll backend every 3s for active alert + refresh logs ─────────────────
  const pollActiveAlert = async () => {
    try {
      const response = await api.getActiveAlert(user._id)
      if (response.alertTriggered) {
        setAlert({
          alertTriggered: true,
          alertType: response.alertType,
          alertTimestamp: response.alertTimestamp,
          alertStatus: response.status,
          notifiedContacts: response.notifiedContacts || [],
          logId: response.logId,
        })
      }
      fetchLogs()
    } catch {
      // backend unavailable — context state still shows alert
    }
  }

  useEffect(() => {
    fetchLogs()
    pollActiveAlert()
    pollRef.current = setInterval(pollActiveAlert, 3000)
    return () => clearInterval(pollRef.current)
  }, [user._id])

  // ── Listen to context custom event for INSTANT sync (no poll delay) ───────
  useEffect(() => {
    const onAlertUpdated = (e) => {
      const detail = e.detail
      if (detail?.alertTriggered) {
        // Prepend a synthetic log entry immediately so list updates without waiting for backend
        setEmergencyLogs((prev) => {
          const syntheticId = `local-${Date.now()}`
          // Avoid duplicate if backend log already exists
          if (prev.some((l) => l._id === syntheticId)) return prev
          const entry = {
            _id: syntheticId,
            alertType: detail.alertType || "Auto",
            status: detail.alertStatus || "Alert Sent",
            notifiedContacts: detail.notifiedContacts || [],
            timestamp: detail.alertTimestamp || new Date().toISOString(),
            resolved: false,
          }
          return [entry, ...prev]
        })
      }
    }
    window.addEventListener("sos-alert-updated", onAlertUpdated)
    return () => window.removeEventListener("sos-alert-updated", onAlertUpdated)
  }, [])

  // ── Manual SOS button ─────────────────────────────────────────────────────
  const handleSOS = async () => {
    if (isSending) return
    setIsSending(true)

    const alertTimestamp = new Date().toISOString()

    // Step 1: Optimistic UI — prepend log entry instantly
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticEntry = {
      _id: optimisticId,
      alertType: "Manual",
      status: "Alert Sent",
      notifiedContacts: [],
      timestamp: alertTimestamp,
      resolved: false,
    }
    setEmergencyLogs((prev) => [optimisticEntry, ...prev])

    // Step 2: Update shared context immediately
    setAlert({
      alertTriggered: true,
      alertType: "Manual",
      alertTimestamp,
      alertStatus: "Alert Sent",
      notifiedContacts: [],
      logId: null,
    })

    // Step 3: Show toast immediately
    showToast("🚨 Alert Sent Successfully!", "error")

    // Step 4: Call backend
    try {
      const response = await api.triggerSOS({ userId: user._id, alertType: "Manual" })

      // Replace optimistic entry with real backend entry
      setEmergencyLogs((prev) =>
        prev.map((l) =>
          l._id === optimisticId
            ? { ...response.log, notifiedContacts: response.notifiedContacts || [] }
            : l
        )
      )

      // Update context with real logId + contacts
      setAlert({
        alertTriggered: true,
        alertType: "Manual",
        alertTimestamp,
        alertStatus: "Alert Sent",
        notifiedContacts: response.notifiedContacts || [],
        logId: response.log?._id || null,
      })
    } catch {
      // Backend down — optimistic entry stays, context alert stays
      showToast("Backend unavailable. Alert saved locally.", "info")
    } finally {
      setIsSending(false)
    }
  }

  // ── Resolve / reset alert ─────────────────────────────────────────────────
  const handleResolve = async () => {
    setResolving(true)
    try {
      if (alertState.logId) {
        await api.resolveAlert(alertState.logId)
      }
      showToast("✅ Alert marked as resolved.", "success")
    } catch {
      // ignore
    } finally {
      clearAlert()
      fetchLogs()
      setResolving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">SOS Emergency</h2>
        <p className="mt-1 text-slate-500">Emergency support and alert dispatch center</p>
      </header>

      {/* ── Active Alert Banner ── */}
      {alertState.alertTriggered ? (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 shadow-md animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-red-800">🚨 Alert Triggered</p>
              <p className="mt-1 text-sm font-medium text-red-700">
                Type: <strong>{alertState.alertType || "Critical Vitals"}</strong>
              </p>
              {alertState.alertTimestamp && (
                <p className="mt-1 text-xs text-red-600">
                  Time: {new Date(alertState.alertTimestamp).toLocaleString()}
                </p>
              )}
              <p className="mt-1 text-sm text-red-700">
                Status:{" "}
                <span className="inline-flex rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-bold text-red-800">
                  {alertState.alertStatus || "Alert Sent"}
                </span>
              </p>
              {alertState.notifiedContacts?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-red-700">Contacts Notified:</p>
                  <ul className="mt-1 space-y-0.5">
                    {alertState.notifiedContacts.map((c) => (
                      <li key={c} className="text-xs text-red-600">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolving}
              className="shrink-0 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              {resolving ? "Resolving..." : "Mark Resolved"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <p className="font-semibold">✅ No Active Alerts</p>
          <p className="mt-1 text-sm">All vitals are within safe range. No emergency detected.</p>
        </div>
      )}

      {/* ── Manual SOS Button ── */}
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <button
          type="button"
          onClick={handleSOS}
          disabled={isSending}
          className={`h-44 w-44 rounded-full bg-red-600 text-4xl font-bold text-white shadow-lg transition hover:bg-red-700 active:scale-95 disabled:opacity-70 ${
            isSending ? "animate-pulse" : ""
          }`}
        >
          SOS
        </button>
        <p className="mt-6 text-lg font-semibold text-slate-700">
          {isSending ? "Sending emergency alerts..." : "Tap to send immediate emergency alert"}
        </p>
      </section>

      {/* ── Emergency Log History ── */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Emergency Log History</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {emergencyLogs.length} entries
          </span>
        </div>

        {emergencyLogs.length === 0 ? (
          <p className="text-sm text-slate-500">No emergency logs yet.</p>
        ) : (
          <div className="space-y-3">
            {emergencyLogs.map((log) => (
              <article
                key={log._id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 transition-all ${
                  log.resolved ? "bg-slate-50" : "bg-red-50 ring-1 ring-red-200"
                }`}
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {log.alertType === "Auto" ? "🤖 Auto Alert" : "🆘 Manual SOS"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.notifiedContacts?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Notified: {log.notifiedContacts.join(", ")}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    log.resolved
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {log.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default SosPage
