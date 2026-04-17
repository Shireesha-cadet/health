import { useEffect, useMemo, useRef, useState } from "react"
import { ShieldCheck, TriangleAlert } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { api } from "../api"
import { useHealth } from "../context/HealthContext"
import { getCurrentUser } from "../utils/session"
import { showToast } from "../components/Toast"

const statusClasses = {
  Normal: "bg-emerald-100 text-emerald-700",
  Warning: "bg-amber-100 text-amber-700",
  Critical: "bg-rose-100 text-rose-700",
}

function checkEmergency(data) {
  if (!data) return false
  const hasAnyValue = data.bpSystolic || data.spo2 || data.heartRate || data.glucose
  if (!hasAnyValue) return false

  const systolic = Number(data.bpSystolic)
  const spo2 = Number(data.spo2)
  const heartRate = Number(data.heartRate)
  const glucose = Number(data.glucose)

  return (
    systolic > 160 ||
    (systolic > 0 && systolic < 90) ||
    spo2 < 92 ||
    heartRate > 120 ||
    (heartRate > 0 && heartRate < 50) ||
    glucose > 200
  )
}

function getAlertType(data) {
  const systolic = Number(data.bpSystolic)
  const spo2 = Number(data.spo2)
  const heartRate = Number(data.heartRate)
  const glucose = Number(data.glucose)
  if (systolic > 160 || (systolic > 0 && systolic < 90)) return "High/Low Blood Pressure"
  if (spo2 < 92) return "Low SpO2"
  if (heartRate > 120 || (heartRate > 0 && heartRate < 50)) return "Abnormal Heart Rate"
  if (glucose > 200) return "High Glucose"
  return "Critical Vitals"
}

function DashboardPage() {
  const user = getCurrentUser()
  const { healthData, alertState, setAlert } = useHealth()
  const [emergencyPopup, setEmergencyPopup] = useState(false)
  const popupTimerRef = useRef(null)
  const lastTriggeredAtRef = useRef(null)

  const triggerSOS = async () => {
    // Prevent duplicate triggers for the same vitals update
    if (lastTriggeredAtRef.current === healthData.updatedAt) return
    lastTriggeredAtRef.current = healthData.updatedAt

    const alertType = getAlertType(healthData)
    const alertTimestamp = new Date().toISOString()

    // 1. Update shared context immediately — SOS page reads this via context + custom event
    setAlert({
      alertTriggered: true,
      alertType,
      alertTimestamp,
      alertStatus: "Alert Sent",
      notifiedContacts: [],
      logId: null,
    })

    // 2. Show toast popup immediately
    showToast(`🚨 Emergency Alert Sent! (${alertType})`, "error")

    // 3. Show banner on dashboard
    setEmergencyPopup(true)
    window.clearTimeout(popupTimerRef.current)
    popupTimerRef.current = window.setTimeout(() => setEmergencyPopup(false), 8000)

    // 4. Persist to backend and update context with real logId
    if (user?._id) {
      try {
        const response = await api.triggerSOS({
          userId: user._id,
          alertType,
          vitals: {
            bpSystolic: healthData.bpSystolic,
            spo2: healthData.spo2,
            heartRate: healthData.heartRate,
            glucose: healthData.glucose,
          },
        })
        if (!response.duplicate) {
          setAlert({
            alertTriggered: true,
            alertType,
            alertTimestamp,
            alertStatus: "Alert Sent",
            notifiedContacts: response.notifiedContacts || [],
            logId: response.log?._id || null,
          })
        }
      } catch {
        // Backend unavailable — context alert still works
      }
    }
  }

  useEffect(() => {
    console.log("HealthData:", healthData)
    if (checkEmergency(healthData)) {
      triggerSOS()
    }
  }, [healthData])

  useEffect(() => {
    return () => window.clearTimeout(popupTimerRef.current)
  }, [])

  const healthCards = useMemo(() => {
    const systolic = Number(healthData.bpSystolic || 0)
    const diastolic = Number(healthData.bpDiastolic || 0)
    const spo2 = Number(healthData.spo2 || 0)
    const glucose = Number(healthData.glucose || 0)
    const heartRate = Number(healthData.heartRate || 0)
    const temp = Number(healthData.temperature || 0)

    const bpStatus = systolic > 140 || diastolic > 90 ? "Warning" : "Normal"
    const spoStatus = spo2 > 0 && spo2 < 95 ? "Warning" : "Normal"
    const glucoseStatus = glucose > 140 ? "Warning" : "Normal"
    const heartStatus = heartRate > 120 ? "Critical" : "Normal"
    const tempStatus = temp > 100.4 ? "Warning" : "Normal"

    return [
      { label: "Heart Rate", value: heartRate ? `${heartRate} bpm` : "--", status: heartStatus, icon: ShieldCheck },
      { label: "Blood Pressure", value: systolic ? `${systolic}/${diastolic}` : "--", status: bpStatus, icon: TriangleAlert },
      { label: "SpO2", value: spo2 ? `${spo2}%` : "--", status: spoStatus, icon: ShieldCheck },
      { label: "Glucose", value: glucose ? `${glucose} mg/dL` : "--", status: glucoseStatus, icon: TriangleAlert },
      { label: "Temperature", value: temp ? `${temp} F` : "--", status: tempStatus, icon: ShieldCheck },
    ]
  }, [healthData])

  const bpWeeklyData = [
    { day: "Mon", systolic: 120, diastolic: 78 },
    { day: "Tue", systolic: 124, diastolic: 80 },
    { day: "Wed", systolic: 128, diastolic: 82 },
    { day: "Thu", systolic: 122, diastolic: 79 },
    { day: "Fri", systolic: 126, diastolic: 81 },
    { day: "Sat", systolic: 130, diastolic: 84 },
    { day: "Sun", systolic: 125, diastolic: 80 },
  ]

  const warningExists = healthCards.some((c) => c.status !== "Normal")

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-slate-500">Real-time monitoring for elderly health metrics</p>
      </header>

      {/* Active alert banner */}
      {(emergencyPopup || alertState.alertTriggered) && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm">
          <p className="font-semibold text-lg">🚨 Emergency Detected!</p>
          <p className="mt-1 text-sm">
            Alert Type: <strong>{alertState.alertType || "Critical Vitals"}</strong>
          </p>
          {alertState.alertTimestamp && (
            <p className="text-xs text-red-700 mt-1">
              Triggered at: {new Date(alertState.alertTimestamp).toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-sm">Emergency Alert Sent to caregiver and emergency contacts.</p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {healthCards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{card.label}</span>
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[card.status]}`}>
                {card.status}
              </span>
            </article>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Weekly Blood Pressure Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#2563EB" strokeWidth={3} />
                <Line type="monotone" dataKey="diastolic" stroke="#0EA5E9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">AI Health Message</h3>
          <div className={`rounded-xl p-4 ${warningExists ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
            <div className="mb-2 flex items-center gap-2">
              {warningExists ? <TriangleAlert size={18} /> : <ShieldCheck size={18} />}
              <p className="font-semibold">{warningExists ? "Mild warning detected" : "Your health is stable today"}</p>
            </div>
            <p className="text-sm">
              {healthData.aiSummary ||
                (warningExists
                  ? "Blood pressure and glucose indicate a mild variation. Continue hydration and follow care plan."
                  : "All critical vitals are in the expected range. Maintain current medicine and routine.")}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
