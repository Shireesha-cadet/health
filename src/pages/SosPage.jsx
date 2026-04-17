import { useEffect, useState } from "react"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

function SosPage() {
  const user = getCurrentUser()
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [emergencyLogs, setEmergencyLogs] = useState([])
  const [notifiedContacts, setNotifiedContacts] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await api.getSOSLogs(user._id)
      setEmergencyLogs(response.logs)
    }
    fetchLogs()
  }, [user._id])

  const handleSOS = async () => {
    setIsSending(true)
    setIsSent(false)
    try {
      const response = await api.triggerSOS({ userId: user._id })
      setNotifiedContacts(response.notifiedContacts)
      setIsSending(false)
      setIsSent(true)
      const logsResponse = await api.getSOSLogs(user._id)
      setEmergencyLogs(logsResponse.logs)
    } catch {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">SOS Emergency</h2>
        <p className="mt-1 text-slate-500">Emergency support and alert dispatch center</p>
      </header>

      <section className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <button
          type="button"
          onClick={handleSOS}
          className={`h-44 w-44 rounded-full bg-red-600 text-4xl font-bold text-white shadow-lg transition hover:bg-red-700 ${
            isSending ? "animate-pulse" : ""
          }`}
        >
          SOS
        </button>
        <p className="mt-6 text-lg font-semibold text-slate-700">
          {isSending
            ? "Sending emergency alerts..."
            : isSent
              ? "Alert sent successfully"
              : "Tap button to send immediate emergency alert"}
        </p>
      </section>
      {notifiedContacts.length > 0 && (
        <section className="rounded-2xl bg-blue-50 p-4 text-blue-900 ring-1 ring-blue-100">
          <p className="font-semibold">Contacts Notified:</p>
          <ul className="mt-2 space-y-1 text-sm">
            {notifiedContacts.map((contact) => (
              <li key={contact}>{contact}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Emergency Log History</h3>
        <div className="space-y-3">
          {emergencyLogs.map((log) => (
            <article key={log._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="font-medium text-slate-800">SOS Alert Triggered</p>
                <p className="text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{log.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SosPage
