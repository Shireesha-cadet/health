
import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Ambulance, Clock, MapPin, Navigation } from "lucide-react"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const makeAmbIcon = (moving) => L.divIcon({
  html: `<div style="font-size:34px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));animation:${moving ? "amb 0.5s ease-in-out infinite alternate" : "none"}">🚑</div>`,
  iconSize: [40, 40], iconAnchor: [20, 36], popupAnchor: [0, -38], className: "",
})

const USER_ICON = L.divIcon({
  html: `<div style="width:22px;height:22px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], className: "",
})

function FitBounds({ a, b }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds([[a.lat, a.lng], [b.lat, b.lng]], { padding: [60, 60] })
  }, [a.lat, a.lng, b.lat, b.lng])
  return null
}

const USER_POS  = { lat: 17.4401, lng: 78.4489 }
const AMB_START = { lat: 17.4620, lng: 78.4710 }

function km(a, b) {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
}

export default function AmbulanceTrackerPage() {
  const [amb, setAmb]           = useState(AMB_START)
  const [tracking, setTracking] = useState(false)
  const [arrived, setArrived]   = useState(false)
  const [history, setHistory]   = useState([])
  const ref   = useRef(AMB_START)
  const tick  = useRef(0)
  const timer = useRef(null)

  const dist = parseFloat(km(ref.current, USER_POS).toFixed(2))
  const eta  = parseFloat((dist / 0.4).toFixed(1))

  const start = () => {
    ref.current = AMB_START
    tick.current = 0
    setAmb(AMB_START)
    setArrived(false)
    setTracking(true)
    setHistory([{ t: 0, d: parseFloat(km(AMB_START, USER_POS).toFixed(2)) }])

    timer.current = setInterval(() => {
      tick.current += 1
      const cur = ref.current
      const dLat = USER_POS.lat - cur.lat
      const dLng = USER_POS.lng - cur.lng
      const mag  = Math.sqrt(dLat*dLat + dLng*dLng)
      if (mag < 0.0008) {
        ref.current = { ...USER_POS }
        setAmb({ ...USER_POS })
        setArrived(true)
        setTracking(false)
        clearInterval(timer.current)
        return
      }
      const step = 0.002
      const next = { lat: cur.lat + (dLat/mag)*step, lng: cur.lng + (dLng/mag)*step }
      ref.current = next
      setAmb({ ...next })
      setHistory(h => [...h.slice(-24), { t: tick.current, d: parseFloat(km(next, USER_POS).toFixed(2)) }])
    }, 1000)
  }

  const stop  = () => { clearInterval(timer.current); setTracking(false) }
  const reset = () => { clearInterval(timer.current); ref.current = AMB_START; tick.current = 0; setAmb(AMB_START); setArrived(false); setTracking(false); setHistory([]) }

  useEffect(() => () => clearInterval(timer.current), [])

  return (
    <div className="space-y-6">
      <style>{`@keyframes amb { from{transform:translateY(0) rotate(-4deg)} to{transform:translateY(-7px) rotate(4deg)} }`}</style>

      <header>
        <h2 className="text-3xl font-bold text-slate-900">Ambulance Tracker</h2>
        <p className="mt-1 text-slate-500">Live ambulance movement simulation</p>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Distance", value: `${dist} km`, icon: Navigation, color: "red" },
          { label: "ETA",      value: `${eta} min`, icon: Clock,      color: "blue" },
          { label: "Status",   value: arrived ? "Arrived! 🎉" : tracking ? "En Route 🚑" : "Standby", icon: Ambulance, color: arrived ? "green" : tracking ? "amber" : "slate" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${color}-100`}>
                <Icon size={18} className={`text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {arrived && (
        <div className="rounded-2xl bg-green-50 p-4 text-center ring-1 ring-green-200">
          <p className="text-xl font-bold text-green-800">🚑 Ambulance has arrived at your location!</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!tracking && !arrived && <button onClick={start} className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">🚑 Start Tracking</button>}
        {tracking && <button onClick={stop} className="rounded-xl bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700">⏹ Stop</button>}
        {(tracking || arrived) && <button onClick={reset} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">🔄 Reset</button>}
      </div>

      {/* Map */}
      <section className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
        <MapContainer center={[USER_POS.lat, USER_POS.lng]} zoom={14} style={{ height: "400px", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds a={USER_POS} b={amb} />
          <Marker position={[USER_POS.lat, USER_POS.lng]} icon={USER_ICON}><Popup>📍 Your Location</Popup></Marker>
          <Marker position={[amb.lat, amb.lng]} icon={makeAmbIcon(tracking)} key={`${amb.lat}${amb.lng}`}>
            <Popup>🚑 {dist} km away — ETA {eta} min</Popup>
          </Marker>
          <Polyline positions={[[USER_POS.lat, USER_POS.lng],[amb.lat, amb.lng]]} color="#ef4444" weight={3} dashArray="8 5" />
        </MapContainer>
      </section>

      {/* Graph */}
      {history.length > 1 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><MapPin size={18} className="text-red-500" /> Distance Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tickFormatter={v => `${v}s`} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip formatter={v => [`${v} km`, "Distance"]} labelFormatter={l => `${l}s`} />
              <Line type="monotone" dataKey="d" stroke="#ef4444" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-6 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-100">
        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-blue-500 ring-2 ring-white shadow inline-block" /> Your Location</span>
        <span className="flex items-center gap-2"><span className="text-xl">🚑</span> Ambulance</span>
        <span className="flex items-center gap-2"><span className="inline-block h-0.5 w-8 border-t-2 border-dashed border-red-500" /> Route</span>
      </div>
    </div>
  )
}
