import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const LOCATIONS = ["KPHB", "Gachibowli", "Madhapur", "Kukatpally"]

function RegisterDonorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", bloodGroup: "", phone: "", location: "", available: true })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.registerDonor(form)
      setSuccess(true)
      setTimeout(() => navigate("/donors"), 1500)
    } catch (err) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Register as Donor</h2>
        <p className="mt-1 text-slate-500">Help save lives by registering as a blood donor</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400">
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <select name="location" value={form.location} onChange={handleChange} required
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400">
            <option value="">Select location</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 accent-red-600" />
          <span className="text-sm font-medium text-slate-700">I am currently available to donate</span>
        </label>

        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✅ Registered successfully! Redirecting...</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {loading ? "Registering..." : "Register as Donor"}
        </button>
      </form>
    </div>
  )
}

export default RegisterDonorPage
