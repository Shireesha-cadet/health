import { useEffect, useState } from "react"
import { api } from "../api"

const categories = ["", "Health", "Agriculture", "Housing", "Insurance", "Education", "Business", "Pension"]

function SchemesPage() {
  const [category, setCategory] = useState("")
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSchemes = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await api.getSchemes(category || undefined)
        setSchemes(response.schemes || [])
      } catch (requestError) {
        setError(requestError.message || "Failed to load schemes")
      } finally {
        setLoading(false)
      }
    }
    loadSchemes()
  }, [category])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Government Schemes</h2>
        <p className="mt-1 text-slate-500">Discover welfare programs and apply from official portals.</p>
      </header>

      <select className="rounded-lg border border-slate-200 bg-white px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
        {categories.map((item) => <option key={item || "all"} value={item}>{item || "All Categories"}</option>)}
      </select>

      {loading && <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">Loading schemes...</p>}
      {error && <p className="rounded-lg bg-rose-100 p-4 text-rose-700">Failed to load data: {error}</p>}
      {!loading && !error && schemes.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-600 ring-1 ring-slate-100">No schemes available</p>
      )}

      {!loading && !error && schemes.length > 0 && <section className="grid gap-4 md:grid-cols-2">
        {schemes.map((scheme) => (
          <article key={scheme._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase text-blue-700">{scheme.category}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{scheme.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{scheme.description}</p>
            <p className="mt-2 text-sm text-slate-600"><strong>Benefits:</strong> {scheme.benefits}</p>
            <p className="mt-1 text-sm text-slate-600"><strong>Eligibility:</strong> {scheme.eligibility}</p>
            <a href={scheme.applyLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Apply Now</a>
          </article>
        ))}
      </section>}
    </div>
  )
}

export default SchemesPage
