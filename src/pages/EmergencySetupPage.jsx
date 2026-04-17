import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

function EmergencySetupPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState({ name: "", phone: "", relation: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await api.getEmergencyContacts(user._id)
      setContacts(response.contacts)
    }
    fetchContacts()
  }, [user._id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.addEmergencyContact({ ...form, userId: user._id })
      setForm({ name: "", phone: "", relation: "" })
      setError("")
      const response = await api.getEmergencyContacts(user._id)
      setContacts(response.contacts)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
      <h2 className="text-3xl font-bold text-slate-900">Emergency Contacts Setup</h2>
      <p className="text-slate-500">Add trusted contacts to notify in SOS situations.</p>

      <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" onSubmit={handleSubmit}>
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Contact Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Relation" value={form.relation} onChange={(e) => setForm((prev) => ({ ...prev, relation: e.target.value }))} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700" type="submit">
          Add Contact
        </button>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Saved Contacts</h3>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact._id} className="rounded-lg bg-slate-50 p-3">
              <p className="font-medium text-slate-800">{contact.name}</p>
              <p className="text-sm text-slate-500">{contact.phone} - {contact.relation}</p>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-sm text-slate-500">No contacts yet.</p>}
        </div>
      </section>

      <button
        type="button"
        onClick={() => navigate("/setup/health")}
        className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
      >
        Continue to Health Profile
      </button>
    </div>
  )
}

export default EmergencySetupPage
