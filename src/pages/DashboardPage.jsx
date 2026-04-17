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
import { useHealth } from "../context/HealthContext"

const statusClasses = {
  Normal: "bg-emerald-100 text-emerald-700",
  Warning: "bg-amber-100 text-amber-700",
  Critical: "bg-rose-100 text-rose-700",
}

function DashboardPage() {
  const { healthData } = useHealth()
  const [emergencyPopup, setEmergencyPopup] = useState(false)
  const popupTimerRef = useRef(null)
  const resetTimerRef = useRef(null)

  const checkEmergency = (data) => {
    if (!data) return false

    const systolic = Number(data.bpSystolic)
    const spo2 = Number(data.spo2)
    const heartRate = Number(data.heartRate)
    const glucose = Number(data.glucose)

    const hasAnyValue = data.bpSystolic || data.spo2 || data.heartRate || data.glucose
    if (!hasAnyValue) return false

    return (
      systolic > 160 ||
      systolic < 90 ||
      spo2 < 92 ||
      heartRate > 120 ||
      heartRate < 50 ||
      glucose > 200
    )
  }

  const triggerSOS = () => {
    if (localStorage.getItem("sosTriggered")) return

    localStorage.setItem("sosTriggered", "true")
    localStorage.setItem(
      "lastSOS",
      JSON.stringify({
        time: new Date(),
        status: "Alert Sent",
      })
    )

    setEmergencyPopup(true)

    popupTimerRef.current = window.setTimeout(() => {
      setEmergencyPopup(false)
    }, 5000)

    resetTimerRef.current = window.setTimeout(() => {
      localStorage.removeItem("sosTriggered")
    }, 60000)
  }

  useEffect(() => {
    if (checkEmergency(healthData)) {
      triggerSOS()
    }
  }, [healthData])

  useEffect(() => {
    return () => {
      window.clearTimeout(popupTimerRef.current)
      window.clearTimeout(resetTimerRef.current)
    }
  }, [])

  const healthCards = useMemo(() => {
    const systolic = Number(healthData.bpSystolic || 126)
    const diastolic = Number(healthData.bpDiastolic || 82)
    const spo2 = Number(healthData.spo2 || 97)
    const glucose = Number(healthData.glucose || 142)
    const heartRate = Number(healthData.heartRate || 76)
    const temp = Number(healthData.temperature || 98.4)

    const bpStatus = systolic > 140 || diastolic > 90 ? "Warning" : "Normal"
    const spoStatus = spo2 < 95 ? "Warning" : "Normal"
    const glucoseStatus = glucose > 140 ? "Warning" : "Normal"
    const heartStatus = heartRate > 120 ? "Critical" : "Normal"
    const tempStatus = temp > 100.4 ? "Warning" : "Normal"

    return [
      { label: "Heart Rate", value: `${heartRate} bpm`, status: heartStatus, icon: ShieldCheck },
      { label: "Blood Pressure", value: `${systolic}/${diastolic}`, status: bpStatus, icon: TriangleAlert },
      { label: "SpO2", value: `${spo2}%`, status: spoStatus, icon: ShieldCheck },
      { label: "Glucose", value: `${glucose} mg/dL`, status: glucoseStatus, icon: TriangleAlert },
      { label: "Temperature", value: `${temp} F`, status: tempStatus, icon: ShieldCheck },
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

  const warningExists = healthCards.some((card) => card.status !== "Normal")

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-slate-500">Real-time monitoring for elderly health metrics</p>
      </header>

      {emergencyPopup && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm">
          <p className="font-semibold">🚨 Emergency Detected!</p>
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
          <div
            className={`rounded-xl p-4 ${
              warningExists ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
            }`}
          >
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
