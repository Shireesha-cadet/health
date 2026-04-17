import { Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { api } from "../api"

function HospitalsPage() {
  const [location, setLocation] = useState("")
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await api.getHospitals(location || undefined)
        setHospitals(response.hospitals || [])
      } catch (requestError) {
        setError(requestError.message || "Failed to load hospitals")
      } finally {
        setLoading(false)
      }
    }
    loadHospitals()
  }, [location])

  const sortedHospitals = useMemo(() => [...hospitals].sort((a, b) => b.rating - a.rating), [hospitals])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Hospitals</h2>
        <p className="mt-1 text-slate-500">Nearby hospitals sorted by top rating</p>
      </header>
      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
      >
        <option value="">All Locations</option>
        <option value="KPHB">KPHB</option>
        <option value="Gachibowli">Gachibowli</option>
        <option value="Aziznagar">Aziznagar</option>
      </select>

      {loading && <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">Loading hospitals...</p>}
      {error && <p className="rounded-lg bg-rose-100 p-4 text-rose-700">Failed to load data: {error}</p>}
      {!loading && !error && sortedHospitals.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">No hospitals available</p>
      )}

      {!loading && !error && sortedHospitals.length > 0 && <section className="grid gap-4 md:grid-cols-2">
        {sortedHospitals.map((hospital) => (
          <article key={hospital._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <img
              src={hospital.image}
              alt={hospital.name}
              className="h-44 w-full rounded-t-2xl object-cover"
              loading="lazy"
            />
            <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">{hospital.name}</h3>
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-amber-500">
              <Star size={15} fill="currentColor" />
              {hospital.rating} / 5
            </p>
            <p className="mt-1 text-sm text-slate-600">{hospital.specialization}</p>
            <p className="text-sm text-slate-500">{hospital.location}</p>
            <a
              href={hospital.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open in Google Maps
            </a>
            </div>
          </article>
        ))}
      </section>}
    </div>
  )
}

export default HospitalsPage
